<?php

namespace App\Http\Controllers\Api\V1\Pledge;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Pledge\StorePledgeRequest;
use App\Http\Requests\Pledge\UpdatePledgeRequest;
use App\Models\Pledge\Pledge;
use App\Models\Pledge\Loan;
use App\Models\Pledge\Jewel;
use App\Models\Pledge\MediaFile;
use App\Models\Pledge\Customer;
use App\Models\Admin\MoneySource\MoneySource;
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

        if (!$user->can('pledge.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = Pledge::with(['customer', 'loan', 'jewels', 'media', 'closure']);

        if (!$user->hasRole('admin')) {
            $query->where('branch_id', $user->branch_id);
        }


        // Report Filtering
        if ($reportType = $request->query('report_type')) {
            if ($reportType === 'overdue') {
                $query->whereHas('loan', function ($q) {
                    $q->where('status', 'active') // Assuming 'active' is the status for open loans
                        ->where('due_date', '<', now());
                });
            } elseif ($reportType === 'annual') {
                $query->whereHas('loan', function ($q) {
                    // Annual due: active loans created more than 1 year ago
                    $oneYearAgo = now()->subYear();
                    $q->where('status', 'active')
                        ->where('date', '<', $oneYearAgo);
                });
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                // Search Customer Name or Mobile
                $q->whereHas('customer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile_no', 'like', "%{$search}%");
                })
                    // Search Loan Number
                    ->orWhereHas('loan', function ($q) use ($search) {
                        $q->where('loan_no', 'like', "%{$search}%");
                    })
                    // Search Pledge ID
                    ->orWhere('id', $search);
            });
        }

        // Lightweight Suggestions Mode
        if ($request->query('suggestions')) {
            $results = $query->take(10)->get()->map(function ($pledge) {
                return [
                    'id' => $pledge->id,
                    'loan_no' => $pledge->loan->loan_no ?? 'No Loan No',
                    'customer_name' => $pledge->customer->name ?? 'Unknown',
                    'mobile_no' => $pledge->customer->mobile_no ?? '',
                ];
            });
            return response()->json(['data' => $results]);
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

        // Check permission
        if (!$user->can('pledge.create')) {
            return response()->json([
                'message' => 'You do not have permission to create pledges',
                'error' => 'insufficient_permissions'
            ], 403);
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
                $customerData = $request->validated()['customer'];
                // Filter out empty strings and convert to null
                $customerData = array_map(function ($value) {
                    return $value === '' ? null : $value;
                }, $customerData);

                // Create or reuse customer
                if ($request->filled('customer_id')) {
                    $customer = Customer::findOrFail($request->customer_id);
                    $customer->update($customerData);
                } else {
                    Log::info('Creating customer', ['data' => $customerData]);
                    $customer = Customer::create($customerData);
                }
                Log::info('Customer ID resolved', ['id' => $customer->id]);

                Log::info('Creating pledge', [
                    'customer_id' => $customer->id,
                    'branch_id' => $user->branch_id,
                ]);

                $pledge = Pledge::create([
                    'customer_id' => $customer->id,
                    'branch_id' => $user->branch_id,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                    'status' => $request->input('pledge.status', 'active'),
                    'reference_no' => $request->input('pledge.reference_no') ?? null,
                ]);
                Log::info('Pledge created', ['id' => $pledge->id]);

                // Jewels
                $jewels = $request->input('jewels', []);
                Log::info('Processing jewels', ['count' => count($jewels)]);
                foreach ($jewels as $j) {
                    // Filter out empty strings and ensure proper types
                    $jewelData = array_map(function ($value) {
                        if ($value === '')
                            return null;
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
                $loanData = array_map(function ($value) {
                    if ($value === '')
                        return null;
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
                if (isset($loanData['metal_rate']) && $loanData['metal_rate'] !== null) {
                    $loanData['metal_rate'] = (float) $loanData['metal_rate'];
                }
                $loanData['pledge_id'] = $pledge->id;
                Log::info('Creating loan', ['data' => $loanData]);
                $loan = Loan::create($loanData);
                Log::info('Loan created', ['id' => $loan->id]);

                // Deduct balance from Money Source
                if (!empty($loan->payment_method) && !empty($loan->amount_to_be_given)) {
                    $moneySource = MoneySource::where('name', $loan->payment_method)->first();
                    if ($moneySource) {
                        if (!$moneySource->is_outbound) {
                            throw new \Exception("The selected payment method '{$moneySource->name}' is not allowed for outbound transactions.");
                        }
                        $moneySource->decrement('balance', $loan->amount_to_be_given);

                        // Create Transaction Record
                        \App\Models\Transaction\Transaction::create([
                            'branch_id' => $user->branch_id,
                            'money_source_id' => $moneySource->id,
                            'type' => 'debit',
                            'amount' => $loan->amount_to_be_given,
                            'date' => now(), // or $loan->date if strictly following loan date
                            'description' => "Loan Disbursment for Pledge #{$pledge->id} (Cust: {$customer->name})",
                            'category' => 'loan',
                            'transactionable_type' => \App\Models\Pledge\Loan::class,
                            'transactionable_id' => $loan->id,
                            'created_by' => $user->id,
                        ]);

                        Log::info('Money source balance deducted', [
                            'source' => $moneySource->name,
                            'deducted' => $loan->amount_to_be_given,
                            'new_balance' => $moneySource->balance
                        ]);
                    } else {
                        Log::warning('Money source not found for deduction', ['name' => $loan->payment_method]);
                    }
                }

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
                        'pledge_id' => $pledge->id,
                        'loan_id' => $loan->id,
                        'jewel_id' => null, // Explicitly null as requested
                        'type' => explode('/', $file->getClientMimeType())[0] ?? 'file',
                        'category' => $category,
                        'file_path' => $path,
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }

                return response()->json([
                    'message' => 'Pledge created successfully',
                    'data' => $pledge->load(['customer', 'loan', 'jewels', 'media']),
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
        return response()->json($pledge->load(['customer', 'loan', 'jewels', 'media', 'closure']));
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
                        $oldAmount = $loan->amount_to_be_given;
                        // Determine payment method (could be updated or existing)
                        $paymentMethodName = $data['loan']['payment_method'] ?? $loan->payment_method;

                        $loan->update($data['loan']);

                        // Smart Balance Update
                        if (isset($data['loan']['amount_to_be_given'])) {
                            $newAmount = (float) $data['loan']['amount_to_be_given'];
                            $diff = $newAmount - $oldAmount;

                            Log::debug('Pledge Update Logic Trace', [
                                'pledge_id' => $pledge->id,
                                'old_amount' => $oldAmount,
                                'new_amount' => $newAmount,
                                'diff' => $diff,
                                'payment_method' => $paymentMethodName
                            ]);

                            if (abs($diff) > 0 && !empty($paymentMethodName)) {
                                $moneySource = MoneySource::where('name', $paymentMethodName)->first();

                                if ($moneySource) {
                                    if ($diff > 0) {
                                        // Amount Increased: Deduct difference
                                        Log::debug('Increasing Loan Amount', ['deduct_diff' => $diff]);
                                        if (!$moneySource->is_outbound) {
                                            throw new \Exception("Payment method '{$moneySource->name}' not allowed for outbound.");
                                        }
                                        $moneySource->decrement('balance', $diff);

                                        \App\Models\Transaction\Transaction::create([
                                            'branch_id' => $pledge->branch_id,
                                            'money_source_id' => $moneySource->id,
                                            'type' => 'debit',
                                            'amount' => $diff,
                                            'date' => now(),
                                            'description' => "Loan incr. Pledge #{$pledge->id}",
                                            'category' => 'loan',
                                            'transactionable_type' => \App\Models\pledge\Loan::class,
                                            'transactionable_id' => $loan->id,
                                            'created_by' => $request->user()->id,
                                        ]);
                                    } else {
                                        // Amount Decreased: Refund difference (Credit)
                                        $refundAmount = abs($diff);
                                        Log::debug('Decreasing Loan Amount', ['refund_amount' => $refundAmount]);
                                        $moneySource->increment('balance', $refundAmount);

                                        \App\Models\Transaction\Transaction::create([
                                            'branch_id' => $pledge->branch_id,
                                            'money_source_id' => $moneySource->id,
                                            'type' => 'credit',
                                            'amount' => $refundAmount,
                                            'date' => now(),
                                            'description' => "Loan decr. Pledge #{$pledge->id}",
                                            'category' => 'loan',
                                            'transactionable_type' => \App\Models\pledge\Loan::class,
                                            'transactionable_id' => $loan->id,
                                            'created_by' => $request->user()->id,
                                        ]);
                                    }
                                } else {
                                    Log::warning('Money Source not found for update', ['name' => $paymentMethodName]);
                                }
                            } else {
                                Log::debug('No difference or no payment method', ['diff' => $diff, 'method' => $paymentMethodName]);
                            }
                        }

                    } else {
                        $data['loan']['pledge_id'] = $pledge->id;
                        $loan = Loan::create($data['loan']);

                        // New loan created during update (rare but possible), trigger original deduction logic if needed
                        // For now, simpler to leave this as standard creation or duplicate logic if required.
                        // Assuming standard creation flow handles initial deduction usually.
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
                        'pledge_id' => $pledge->id,
                        'loan_id' => $pledge->loan?->id,
                        'jewel_id' => null,
                        'type' => explode('/', $file->getClientMimeType())[0] ?? 'file',
                        'category' => $category,
                        'file_path' => $path,
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }

                return response()->json([
                    'message' => 'Pledge updated successfully',
                    'data' => $pledge->fresh()->load(['customer', 'loan', 'jewels', 'media']),
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
    /**
     * POST /api/pledges/{pledge}/close
     */
    public function close(Request $request, Pledge $pledge)
    {
        $this->authorize('update', $pledge);

        $validated = $request->validate([
            'closed_date' => 'required|date',
            'calculation_method' => 'required|string',
            'balance_amount' => 'nullable|numeric',
            'reduction_amount' => 'required|numeric',
            'totalInterest' => 'required|numeric',
            'interestReduction' => 'nullable|numeric',
            'additionalReduction' => 'nullable|numeric',
            'totalAmount' => 'required|numeric',
            'totalMonths' => 'nullable|string',
            'finalInterestRate' => 'nullable|string',
            'metal_rate' => 'nullable|numeric',
            'payment_source_id' => 'required|exists:money_sources,id',
            'amount_paid' => 'required|numeric|min:0',
        ]);

        try {
            return DB::transaction(function () use ($validated, $pledge, $request) {
                // 1. Create Closure Record
                $closure = \App\Models\Pledge\PledgeClosure::create([
                    'pledge_id' => $pledge->id,
                    'created_by' => $request->user()->id,
                    'closed_date' => $validated['closed_date'],
                    'calculation_method' => $validated['calculation_method'],
                    'balance_amount' => $validated['balance_amount'] ?? 0,
                    'reduction_amount' => $validated['reduction_amount'],
                    'calculated_interest' => $validated['totalInterest'],
                    'interest_reduction' => $validated['interestReduction'] ?? 0,
                    'additional_reduction' => $validated['additionalReduction'] ?? 0,
                    'total_payable' => $validated['totalAmount'],
                    'duration_str' => $validated['totalMonths'],
                    'interest_rate_snapshot' => $validated['finalInterestRate'],
                    'status' => $pledge->status, // Save current status (e.g. overdue/active)
                    'metal_rate' => $validated['metal_rate'] ?? null,
                ]);

                // 2. Handle Payment Source & Transaction
                $moneySource = MoneySource::lockForUpdate()->find($validated['payment_source_id']);
                $amountPaid = $validated['amount_paid'];

                if ($amountPaid > 0) {
                    // Credit the amount to the money source (Income)
                    $moneySource->increment('balance', $amountPaid);

                    // Create Transaction Record
                    \App\Models\Transaction\Transaction::create([
                        'branch_id' => $request->user()->branch_id,
                        'money_source_id' => $moneySource->id,
                        'type' => 'credit', // Income
                        'amount' => $amountPaid,
                        'date' => $validated['closed_date'],
                        'description' => "Pledge Closure Payment #{$pledge->id} (Cust: {$pledge->customer->name})",
                        'category' => 'loan_repayment',
                        'transactionable_type' => \App\Models\Pledge\PledgeClosure::class,
                        'transactionable_id' => $closure->id,
                        'created_by' => $request->user()->id,
                    ]);
                }

                // 3. Handle Pending Balance Task
                $balanceAmount = $validated['balance_amount'] ?? 0;
                if ($balanceAmount > 0) {
                    \App\Models\Admin\Task\Task::create([
                        'title' => "Pending Balance: {$pledge->loan->loan_no}",
                        'description' => "Collect pending balance of ₹{$balanceAmount} from customer {$pledge->customer->name} (Mobile: {$pledge->customer->mobile_no}).",
                        'assigned_to' => null, // Branch Task
                        'created_by' => $request->user()->id,
                        'status' => 'pending',
                        'branch_id' => $pledge->branch_id,
                        'due_date' => now()->addDays(7), // Default due date
                    ]);
                }

                // 4. Update Pledge Status
                $pledge->update(['status' => 'closed']);

                // 4. Update Loan Status
                if ($pledge->loan) {
                    $pledge->loan->update(['status' => 'closed']);
                }

                return response()->json([
                    'message' => 'Pledge closed successfully',
                    'data' => $closure
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error closing pledge: ' . $e->getMessage(), [
                'pledge_id' => $pledge->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to close pledge',
                'error' => config('app.debug') ? $e->getMessage() : 'server_error'
            ], 500);
        }
    }
}
