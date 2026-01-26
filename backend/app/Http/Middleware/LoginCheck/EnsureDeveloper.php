<?php

namespace App\Http\Middleware\LoginCheck;

use Closure;
use Illuminate\Http\Request;

class EnsureDeveloper
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'developer') {
            return response()->json(['message' => 'Forbidden. Developer access required.'], 403);
        }
        return $next($request);
    }
}
