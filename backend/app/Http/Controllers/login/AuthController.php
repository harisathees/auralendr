<?php

namespace App\Http\Controllers\login;

use App\Http\Controllers\Controller;
use App\Models\BranchAndUser\User;
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
            return response()->json(['message'=>'Invalid input','errors'=>$validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generic message to avoid user enumeration
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // create personal access token
        $token = $user->createToken('api_token')->plainTextToken;

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
