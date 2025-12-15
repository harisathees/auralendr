<?php

namespace App\Http\Controllers\pledge;

use App\Http\Controllers\Controller;
use App\Http\Requests\pledge\StorePledgeRequest;
use App\Http\Requests\pledge\UpdatePledgeRequest;
use App\Models\pledge\Pledge;
use App\Models\pledge\Loan;
use App\Models\pledge\Jewel;
use App\Models\pledge\MediaFile;
use App\Models\pledge\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PledgeController extends Controller
{
    // Middleware is applied in routes/api.php

    /**
     * GET /api/pledges
     * - Admin sees all pledges
     * - Staff sees only pledges from their branch
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Pledge::with(['customer', 'loan', 'jewels', 'media']);

        if (! $user->hasRole('admin')) {
            $query->where('branch_id', $user->branch_id);
        }

        $perPage = (int) $request->query('per_page', 20);

        return response()->json($query->orderByDesc('id')->paginate($perPage));
    }

    /**
     * POST /api/pledges
     * Create a full pledge (customer, pledge, jewels, loan, media)
     */
    public function store(StorePledgeRequest $request)
    {
        $user = $request->user();

        // Check permission manually since middleware is temporarily disabled
        try {
            // Check roles (both Spatie roles and legacy 'role' column)
            $isAdmin = $user->hasRole('admin') || $user->role === 'admin';
            $isStaff = $user->hasRole('staff') || $user->role === 'staff';
            
            if (!$isAdmin && !$isStaff && !$user->hasPermissionTo('pledge.create', 'sanctum')) {
                return response()->json([
                    'message' => 'You do not have permission to create pledges',
                    'error' => 'insufficient_permissions'
                ], 403);
            }
        } catch (\Exception $e) {
            // If permission check fails, log and allow (for debugging)
            Log::warning('Permission check failed, allowing request', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }

        // Log the request for debugging
        Log::info('Pledge creation request received', [
            'user_id' => $user->id,
            'has_customer' => $request->has('customer'),
            'has_loan' => $request->has('loan'),
            'has_jewels' => $request->has('jewels'),
            'has_files' => $request->hasFile('files') || $request->hasFile('files.0'),
        ]);

        // Validate branch_id exists
        if (!$user->branch_id) {
            return response()->json([
                'message' => 'User must be assigned to a branch to create pledges',
                'error' => 'missing_branch_id'
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $user) {
                // Create or reuse customer - here we always create
                $customerData = $request->validated()['customer'];
                // Filter out empty strings and convert to null
                $customerData = array_map(function($value) {
                    return $value === '' ? null : $value;
                }, $customerData);
                
                Log::info('Creating customer', ['data' => $customerData]);
                $customer = Customer::create($customerData);
                Log::info('Customer created', ['id' => $customer->id]);

                Log::info('Creating pledge', [
                    'customer_id' => $customer->id,
                    'branch_id' => $user->branch_id,
                ]);
                
                $pledge = Pledge::create([
                    'customer_id' => $customer->id,
                    'branch_id'   => $user->branch_id,
                    'created_by'  => $user->id,
                    'updated_by'  => $user->id,
                    'status'      => $request->input('pledge.status', 'active'),
                    'reference_no'=> $request->input('pledge.reference_no') ?? null,
                ]);
                Log::info('Pledge created', ['id' => $pledge->id]);

                // Jewels
                $jewels = $request->input('jewels', []);
                Log::info('Processing jewels', ['count' => count($jewels)]);
                foreach ($jewels as $j) {
                    // Filter out empty strings and ensure proper types
                    $jewelData = array_map(function($value) {
                        if ($value === '') return null;
                        return $value;
                    }, $j);
                    // Ensure numeric types
                    if (isset($jewelData['pieces']) && $jewelData['pieces'] !== null) {
                        $jewelData['pieces'] = (int) $jewelData['pieces'];
                    }
                    if (isset($jewelData['weight']) && $jewelData['weight'] !== null) {
                        $jewelData['weight'] = (float) $jewelData['weight'];
                    }
                    // Only create if jewel_type is provided (required field)
                    if (!empty($jewelData['jewel_type'])) {
                        $jewelData['pledge_id'] = $pledge->id;
                        Jewel::create($jewelData);
                    }
                }

                // Loan
                $loanData = $request->validated()['loan'];
                // Filter out empty strings and convert to null, ensure numeric types
                $loanData = array_map(function($value) {
                    if ($value === '') return null;
                    return $value;
                }, $loanData);
                // Ensure amount is numeric
                $loanData['amount'] = (float) $loanData['amount'];
                if (isset($loanData['interest_percentage']) && $loanData['interest_percentage'] !== null) {
                    $loanData['interest_percentage'] = (float) $loanData['interest_percentage'];
                }
                if (isset($loanData['validity_months']) && $loanData['validity_months'] !== null) {
                    $loanData['validity_months'] = (int) $loanData['validity_months'];
                }
                $loanData['pledge_id'] = $pledge->id;
                Log::info('Creating loan', ['data' => $loanData]);
                $loan = Loan::create($loanData);
                Log::info('Loan created', ['id' => $loan->id]);

                // Files - Handle 'files[]' array notation from frontend
                // When files are sent as files[], Laravel stores them as files.0, files.1, etc.
                $uploadedFiles = [];
                
                // Check for indexed files (files.0, files.1, etc.) - handles files[] array notation
                $index = 0;
                while ($request->hasFile("files.{$index}")) {
                    $uploadedFiles[] = $request->file("files.{$index}");
                    $index++;
                }
                
                // Fallback: Check for single 'files' key (in case it's sent differently)
                if (empty($uploadedFiles) && $request->hasFile('files')) {
                    $file = $request->file('files');
                    // Handle both single file and array of files
                    if (is_array($file)) {
                        $uploadedFiles = $file;
                    } else {
                        $uploadedFiles = [$file];
                    }
                }

                // Manual Validation of Files because Request validation swallows upload errors
                foreach ($uploadedFiles as $index => $file) {
                    if (!$file->isValid()) {
                        return response()->json([
                            'message' => 'File upload error',
                            'error' => "File at index {$index} failed: " . $file->getErrorMessage()
                        ], 422);
                    }
                }

                // Get categories array
                $categories = $request->input('categories', []);

                // Process uploaded files
                foreach ($uploadedFiles as $index => $file) {
                    $timestamp = now()->format('Ymd_His');
                    $loanNoSafe = preg_replace('/[^A-Za-z0-9\-]/', '', $loan->loan_no ?? 'NoLoan');
                    
                    // Determine category
                    $category = $categories[$index] ?? 'uploaded_file';
                    
                    $extension = $file->getClientOriginalExtension();
                    // filename format: LoanNo_Category_DateTime_UniqID.ext
                    $filename = "{$category}_{$loanNoSafe}_{$timestamp}_" . uniqid() . ".{$extension}";

                    $path = $file->storeAs('pledge_media', $filename, 'public');

                    MediaFile::create([
                        'customer_id' => $customer->id,
                        'pledge_id'   => $pledge->id,
                        'loan_id'     => $loan->id,
                        'jewel_id'    => null, // Explicitly null as requested
                        'type'        => explode('/', $file->getClientMimeType())[0] ?? 'file',
                        'category'    => $category,
                        'file_path'   => $path,
                        'mime_type'   => $file->getClientMimeType(),
                        'size'        => $file->getSize(),
                    ]);
                }

                return response()->json([
                    'message' => 'Pledge created successfully',
                    'data'    => $pledge->load(['customer', 'loan', 'jewels', 'media']),
                ], 201);
            }, 5);
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error creating pledge: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to create pledge due to database error',
                'error' => config('app.debug') ? $e->getMessage() : 'database_error'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error creating pledge: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to create pledge',
                'error' => config('app.debug') ? $e->getMessage() : 'server_error'
            ], 500);
        }
    }

    /**
     * GET /api/pledges/{pledge}
     */
    public function show(Pledge $pledge, Request $request)
    {
        $this->authorize('view', $pledge);
        return response()->json($pledge->load(['customer','loan','jewels','media']));
    }

    /**
     * PUT /api/pledges/{pledge}
     */
    public function update(UpdatePledgeRequest $request, Pledge $pledge)
    {
        $this->authorize('update', $pledge);

        try {
            return DB::transaction(function () use ($request, $pledge) {
                $data = $request->validated();

                // Update pledge basic fields
                if (isset($data['pledge'])) {
                    $pledge->update($data['pledge']);
                }

                // Update customer
                if (isset($data['customer'])) {
                    $pledge->customer->update($data['customer']);
                }

                // Update loan
                if (isset($data['loan'])) {
                    $loan = $pledge->loan;
                    if ($loan) {
                        $loan->update($data['loan']);
                    } else {
                        $data['loan']['pledge_id'] = $pledge->id;
                        $loan = Loan::create($data['loan']);
                    }
                }

                // Handle Jewel Updates (Sync approach)
                if (isset($data['jewels'])) {
                    $incomingJewels = $data['jewels'];
                    $incomingIds = array_filter(array_column($incomingJewels, 'id')); // Get IDs of jewels being updated

                    // Delete jewels that are not in the incoming list
                    $pledge->jewels()->whereNotIn('id', $incomingIds)->delete();

                    foreach ($incomingJewels as $j) {
                        if (isset($j['id']) && $j['id']) {
                            // Update existing jewel
                            $existingJewel = Jewel::find($j['id']);
                            if ($existingJewel && $existingJewel->pledge_id == $pledge->id) {
                                $existingJewel->update($j);
                            }
                        } else {
                            // Create new jewel
                            $j['pledge_id'] = $pledge->id;
                            Jewel::create($j);
                        }
                    }
                }

                // Handle File Deletion
                if ($request->has('deleted_file_ids')) {
                    $deletedIds = $request->input('deleted_file_ids');
                    if (is_array($deletedIds)) {
                        $filesToDelete = MediaFile::whereIn('id', $deletedIds)
                            ->where('pledge_id', $pledge->id)
                            ->get();

                        foreach ($filesToDelete as $fileRecord) {
                            // Delete physical file
                            if ($fileRecord->file_path && Storage::disk('public')->exists($fileRecord->file_path)) {
                                Storage::disk('public')->delete($fileRecord->file_path);
                            }
                            // Delete record
                            $fileRecord->delete();
                        }
                    }
                }

                // Handle uploaded files (append) - Handle 'files[]' array notation from frontend
                $uploadedFiles = [];
                
                // Check for indexed files (files.0, files.1, etc.) - handles files[] array notation
                $index = 0;
                while ($request->hasFile("files.{$index}")) {
                    $uploadedFiles[] = $request->file("files.{$index}");
                    $index++;
                }
                
                // Fallback: Check for single 'files' key (in case it's sent differently)
                if (empty($uploadedFiles) && $request->hasFile('files')) {
                    $file = $request->file('files');
                    // Handle both single file and array of files
                    if (is_array($file)) {
                        $uploadedFiles = $file;
                    } else {
                        $uploadedFiles = [$file];
                    }
                }

                // Get categories array
                $categories = $request->input('categories', []);

                // Process uploaded files
                foreach ($uploadedFiles as $index => $file) {
                    $timestamp = now()->format('Ymd_His');
                    $currentLoanNo = $pledge->loan ? $pledge->loan->loan_no : ($data['loan']['loan_no'] ?? 'NoLoan');
                    $loanNoSafe = preg_replace('/[^A-Za-z0-9\-]/', '', $currentLoanNo);
                    
                    // Determine category
                    $category = $categories[$index] ?? 'uploaded_file';

                    $extension = $file->getClientOriginalExtension();
                    $filename = "{$loanNoSafe}_{$category}_{$timestamp}_" . uniqid() . ".{$extension}";

                    $path = $file->storeAs('pledge_media', $filename, 'public');

                    MediaFile::create([
                        'customer_id' => $pledge->customer_id,
                        'pledge_id'   => $pledge->id,
                        'loan_id'     => $pledge->loan?->id,
                        'jewel_id'    => null,
                        'type'        => explode('/', $file->getClientMimeType())[0] ?? 'file',
                        'category'    => $category,
                        'file_path'   => $path,
                        'mime_type'   => $file->getClientMimeType(),
                        'size'        => $file->getSize(),
                    ]);
                }

                return response()->json([
                    'message' => 'Pledge updated successfully',
                    'data'    => $pledge->fresh()->load(['customer','loan','jewels','media']),
                ]);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error updating pledge: ' . $e->getMessage(), [
                'pledge_id' => $pledge->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update pledge due to database error',
                'error' => config('app.debug') ? $e->getMessage() : 'database_error'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error updating pledge: ' . $e->getMessage(), [
                'pledge_id' => $pledge->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to update pledge',
                'error' => config('app.debug') ? $e->getMessage() : 'server_error'
            ], 500);
        }
    }

    /**
     * DELETE /api/pledges/{pledge}
     */
    public function destroy(Pledge $pledge)
    {
        $this->authorize('delete', $pledge);

        // 1. Delete physical files and MediaFile records
        foreach ($pledge->media as $mediaFile) {
            if ($mediaFile->file_path && Storage::disk('public')->exists($mediaFile->file_path)) {
                Storage::disk('public')->delete($mediaFile->file_path);
            }
            $mediaFile->delete();
        }

        // 2. Delete Jewels
        $pledge->jewels()->delete();

        // 3. Delete Loan
        if ($pledge->loan) {
            $pledge->loan->delete();
        }

        // 4. Delete Pledge
        $pledge->delete();

        // 5. Delete Customer (assuming 1:1 relationship based on store logic)
        if ($pledge->customer) {
            $pledge->customer->delete();
        }

        return response()->json(['message' => 'Pledge, Customer, and all associated data deleted successfully']);
    }
}
