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
            $credentials = $request->only('email', 'password');

            // 1. Correct Session Logic: Use Auth::attempt
            // This sets the Laravel session cookies properly for SPA auth
            if (Auth::attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();
                
                /** @var \App\Models\Admin\Organization\User\User $user */
                $user = Auth::user();

                // Staff Time Restriction Logic (Preserved)
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
                                Auth::logout(); // Log them out immediately
                                return response()->json([
                                    'message' => "Access denied: Staff login is only allowed between {$startTime} and {$endTime}"
                                ], 403);
                            }
                        } catch (\Exception $e) { }
                    }
                }

                // Create a token for compatibility if frontend needs it, but session is main driver
                // note: 'api_token' is arbitary name
                $token = $user->createToken('api_token')->plainTextToken;

                // Cache session marker
                Cache::put("user_session_{$user->id}", $token, now()->addDays(7));

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
            return response()->json(['message' => 'Login Critical Error: ' . $e->getMessage()], 500);
        }
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
        // 1. Invalidate Session
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 2. Also cleanup legacy token if present
        $user = $request->user();
        if ($user) {
            Cache::forget("user_session_{$user->id}");
            $user->currentAccessToken()?->delete();
        }
        
        return response()->json(['message' => 'Logged out']);
    }
}
