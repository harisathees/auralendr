<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Organization\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // POST /api/login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input', 'errors' => $validator->errors()], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {

                // Staff Time Restriction Logic
                if ($user->hasRole('staff')) {
                    $branchId = $user->branch_id;
                    $settings = \App\Models\Admin\Organization\UserPrivileges\StaffTimeRestriction::whereIn('key', ['staff_login_start_time', 'staff_login_end_time'])
                        ->where(function ($q) use ($branchId) {
                            $q->where('branch_id', $branchId)
                                ->orWhereNull('branch_id');
                        })
                        ->get();

                    $startSetting = $settings->where('key', 'staff_login_start_time')->sortByDesc('branch_id')->first();
                    $endSetting = $settings->where('key', 'staff_login_end_time')->sortByDesc('branch_id')->first();
                    $startTime = $startSetting ? $startSetting->value : null;
                    $endTime = $endSetting ? $endSetting->value : null;

                    if ($startTime && $endTime) {
                        try {
                            $now = now();
                            $start = \Carbon\Carbon::createFromFormat('H:i', $startTime);
                            $end = \Carbon\Carbon::createFromFormat('H:i', $endTime);

                            if (!$now->between($start, $end)) {
                                return response()->json([
                                    'message' => "Access denied: Staff login is only allowed between {$startTime} and {$endTime}"
                                ], 403);
                            }
                        } catch (\Exception $e) {
                        }
                    }
                }

                // Create a token (Stateless)
                $token = $user->createToken('auth_token')->plainTextToken;

                // Cache session marker (optional, used for legacy logic if needed)
                Cache::put("user_session_{$user->id}", $token, now()->addDays(7));

                // Log Activity
                try {
                    (new \App\Services\ActivityService())->log('login', "User {$user->name} logged in.", null, $user);
                } catch (\Exception $e) {
                    // Fail silently
                }

                return response()->json([
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'branch_id' => $user->branch_id,
                        'branch' => $user->branch ? $user->branch->toArray() : null,
                        'permissions' => $user->getAllPermissions()->pluck('name'),
                    ]
                ]);
            }

            return response()->json(['message' => 'Invalid credentials'], 401);

        } catch (\Throwable $e) {
            return response()->json(['message' => 'Login Error: ' . $e->getMessage()], 500);
        }
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'phone_number' => $request->user()->phone_number,
            'photo_url' => $request->user()->photo_url,
            'role' => $request->user()->role,
            'branch_id' => $request->user()->branch_id,
            'branch' => $request->user()->branch,
            'permissions' => $request->user()->getAllPermissions()->pluck('name'),
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $user = $request->user();

        // Log Activity
        try {
            (new \App\Services\ActivityService())->log('logout', "User {$user->name} logged out.", null, $user);
        } catch (\Exception $e) {
        }

        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        // Also cleanup legacy token if present
        $user = $request->user();
        if ($user) {
            Cache::forget("user_session_{$user->id}");
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * POST /api/me/profile
     * Update logged-in user's profile
     */
    public function updateProfile(Request $request, \App\Services\MediaService $mediaService)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'phone_number' => 'nullable|string|max:20',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user, $validated, $mediaService) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
            ]);

            // Handle File Deletion
            if ($request->has('deleted_file_ids')) {
                $mediaService->deleteUserFiles($request->input('deleted_file_ids'), $user->id);
            }

            // Handle Files (MediaService)
            if ($request->hasFile('files')) {
                $uploadedFiles = $request->file('files');
                $categories = $request->input('categories', []);

                $mediaService->handleUploads(
                    $uploadedFiles,
                    ['user_id' => $user->id],
                    $categories,
                    'User-' . $user->id
                );
            }

            // Force fresh load of media for response
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'branch_id' => $user->branch_id,
                    'branch' => $user->branch ? $user->branch->toArray() : null,
                    'photo_url' => $user->photo_url, // This uses the accessor which prioritizes media
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ]
            ]);
        });
    }
}
