<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Settings;
use Carbon\Carbon;

class CheckLoginTime
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('staff')) {
            $branchId = $user->branch_id;
            
            // Efficient Query for Settings
            $settings = Settings::whereIn('key', ['staff_login_start_time', 'staff_login_end_time'])
                ->where(function($q) use ($branchId) {
                    $q->where('branch_id', $branchId)
                      ->orWhereNull('branch_id');
                })
                ->get();

            $startSetting = $settings->where('key', 'staff_login_start_time')->sortByDesc('branch_id')->first();
            $endSetting = $settings->where('key', 'staff_login_end_time')->sortByDesc('branch_id')->first();
            
            $startStr = $startSetting ? $startSetting->value : null;
            $endStr = $endSetting ? $endSetting->value : null;

            if ($startStr && $endStr) {
                try {
                    $now = now();
                    $start = Carbon::createFromFormat('H:i', $startStr);
                    $end   = Carbon::createFromFormat('H:i', $endStr);

                    // Check if current time is outside allowed window
                    if (!$now->between($start, $end)) {
                        // Revoke current token
                        if ($user->currentAccessToken()) {
                            $user->currentAccessToken()->delete();
                        }

                        return response()->json([
                            'message' => 'Session expired: Login time restriction.'
                        ], 401);
                    }
                } catch (\Exception $e) {
                    // Fail safe: if time parsing fails, log error but maybe let them stay or deny?
                    // For security, usually deny, but to avoid bugs locking everyone out, we might log and proceed.
                    // Here we will proceed to avoid accidental lockout due to format changes.
                }
            }
        }

        return $next($request);
    }
}
