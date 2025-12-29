<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Organization\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

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

        $user = User::where('email', $request->email)->first();

        // Generic message to avoid user enumeration
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // create personal access token
        $token = $user->createToken('api_token')->plainTextToken;

        // Staff Time Restriction Logic
        if ($user->hasRole('staff')) {
            $branchId = $user->branch_id;

            // Priority: Branch Settings > Global Settings
            // We fetch both and merge them in PHP to prefer Branch
            // Or simpler: Fetch specific keys for Branch, if missing fetch Global.

            // Efficient Single Query:
            // WHERE key IN (start_time, end_time) AND (branch_id = X OR branch_id IS NULL)
            // Then sort by branch_id desc (Assuming ID > NULL) to get specific first

            $settings = \App\Models\Admin\Organization\UserPrivileges\StaffTimeRestriction::whereIn('key', ['staff_login_start_time', 'staff_login_end_time'])
                ->where(function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId)
                        ->orWhereNull('branch_id');
                })
                ->get();

            // Extract values, preferring Branch Specific
            $startSetting = $settings->where('key', 'staff_login_start_time')->sortByDesc('branch_id')->first();
            $endSetting = $settings->where('key', 'staff_login_end_time')->sortByDesc('branch_id')->first();

            $startTime = $startSetting ? $startSetting->value : null;
            $endTime = $endSetting ? $endSetting->value : null;

            if ($startTime && $endTime) {
                // ... (existing time check logic)
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
                    // Logic to handle parsing errors gracefully
                }
            }
        }

        // store session in cache for "stay logged in"
        Cache::put("user_session_{$user->id}", $token, now()->addDays(7));

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
                'branch' => $user->branch,
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ]
        ]);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
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
        if ($user) {
            Cache::forget("user_session_{$user->id}");
            $user->currentAccessToken()?->delete();
        }
        return response()->json(['message' => 'Logged out']);
    }
}
