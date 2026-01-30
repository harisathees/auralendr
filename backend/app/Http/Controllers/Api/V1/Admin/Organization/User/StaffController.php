<?php

namespace App\Http\Controllers\Api\V1\Admin\Organization\User;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Organization\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Services\MediaService;

class StaffController extends Controller
{
    protected $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
        // Middleware usually applied in routes/api.php
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['branch', 'media']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('all')) {
            return response()->json($query->orderByDesc('created_at')->get());
        }

        return response()->json($query->orderByDesc('created_at')->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,staff,developer',
            'branch_id' => 'nullable|exists:branches,id',
            'phone_number' => 'nullable|string|max:20',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // 2. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'branch_id' => $validated['branch_id'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
            ]);

            // Sync Spatie Role
            $user->assignRole($validated['role']);

            // 3. Handle Files (MediaService)
            // Expecting files[] and categories[] from FormData
            if ($request->hasFile('files')) {
                $uploadedFiles = $request->file('files');
                $categories = $request->input('categories', []);

                // If it's a single file upload from a simpler form, normalize it?
                // But we are building "exactly like pledge", so we expect array.
                // MediaService::handleUploads handles normalization.

                $this->mediaService->handleUploads(
                    $uploadedFiles,
                    ['user_id' => $user->id],
                    $categories,
                    'User-' . $user->id // Loan No placeholder
                );
            }

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user->load('media')
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = User::with(['branch', 'media', 'roles'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:admin,staff,developer',
            'branch_id' => 'nullable|exists:branches,id',
            'phone_number' => 'nullable|string|max:20',
        ]);

        return DB::transaction(function () use ($request, $user, $validated) {
            $data = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'branch_id' => $validated['branch_id'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
            ];

            if (!empty($validated['password'])) {
                $data['password'] = Hash::make($validated['password']);
            }

            $user->update($data);

            // Sync Spatie Role
            $user->syncRoles([$validated['role']]);

            // Handle File Deletion
            if ($request->has('deleted_file_ids')) {
                $this->mediaService->deleteUserFiles($request->input('deleted_file_ids'), $user->id);
            }

            // Handle Files (MediaService)
            if ($request->hasFile('files')) {
                $uploadedFiles = $request->file('files');
                $categories = $request->input('categories', []);

                $this->mediaService->handleUploads(
                    $uploadedFiles,
                    ['user_id' => $user->id],
                    $categories,
                    'User-' . $user->id
                );
            }

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $user->fresh()->load('media')
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Delete Media
        // Get all media IDs
        $mediaIds = $user->media()->pluck('id')->toArray();
        if (!empty($mediaIds)) {
            $this->mediaService->deleteUserFiles($mediaIds, $user->id);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
