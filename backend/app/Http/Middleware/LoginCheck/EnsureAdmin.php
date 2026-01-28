<?php

namespace App\Http\Middleware\LoginCheck;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        // Check if user exists and has role 'admin'
        if (!$user || !in_array($user->role, ['admin', 'superadmin', 'developer'])) {
            return response()->json(['message' => 'Forbidden. User role: ' . ($user->role ?? 'none')], 403);
        }
        return $next($request);
    }
}
