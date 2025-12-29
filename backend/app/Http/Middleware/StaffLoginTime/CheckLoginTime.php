<?php

namespace App\Http\Middleware\StaffLoginTime;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin\Organization\UserPrivileges\StaffTimeRestriction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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

        // Check if user exists and has 'staff' role
        if ($user && $user->hasRole('staff')) {
            $branchId = $user->branch_id;
            
            // Fetch relevant settings: access_start_time, access_end_time, and timezone
            $keys = ['access_start_time', 'access_end_time', 'timezone'];
            
            // Query settings matching the keys for either the user's branch or global settings (null branch_id)
            $settings = StaffTimeRestriction::whereIn('key', $keys)
                ->where(function($q) use ($branchId) {
                    $q->where('branch_id', $branchId)
                      ->orWhereNull('branch_id');
                })
                ->get();

            // Helper to resolve setting value: Prefer Branch Specific > Global > Default
            $getValue = function($key) use ($settings, $branchId) {
                // 1. Check for Branch Specific Value
                $branchSpecific = $settings->where('key', $key)->where('branch_id', $branchId)->first();
                if ($branchSpecific && !empty($branchSpecific->value)) {
                    return $branchSpecific->value;
                }
                
                // 2. Check for Global Value
                $global = $settings->where('key', $key)->whereNull('branch_id')->first();
                if ($global && !empty($global->value)) {
                    return $global->value;
                }

                return null;
            };

            $startStr = $getValue('access_start_time');
            $endStr = $getValue('access_end_time');
            // Default to app timezone if not configured
            $timezone = $getValue('timezone') ?? config('app.timezone'); 

            // Only enforce if both start and end times are configured
            if ($startStr && $endStr) {
                try {
                    // Get current time in the configured timezone
                    $now = Carbon::now($timezone);
                    
                    // Parse allowed start and end times
                    // createFromFormat will use today's date by default if date parts are missing, which is desired.
                    $startTime = Carbon::createFromFormat('H:i', $startStr, $timezone);
                    $endTime = Carbon::createFromFormat('H:i', $endStr, $timezone);
                    
                    // Ensure the comparison dates are set to the same day as $now to prevent date mismatches
                    $startTime->setDate($now->year, $now->month, $now->day);
                    $endTime->setDate($now->year, $now->month, $now->day);

                    // Check if current time is within the allowed window
                    // inclusive operation: start <= now <= end
                    if (!$now->between($startTime, $endTime)) {
                        
                        // Security Action: Revoke ALL tokens for this user
                        $user->tokens()->delete();

                        return response()->json([
                            'message' => 'Access Denied: Your login session is outside of allowed working hours.',
                            'code' => 'TIME_RESTRICTION_EXPIRED'
                        ], 401);
                    }
                } catch (\Exception $e) {
                    // Log the error for admin review
                    Log::error("Time Restriction Check Error for User ID {$user->id}: " . $e->getMessage());

                    // Fail Closed: If we can't validate time, we must deny access to be safe
                    // But we might want to avoid locking out if it's just a format error?
                    // Given 'Production Level Security', failing closed is safer.
                    $user->tokens()->delete();
                    
                    return response()->json([
                        'message' => 'Security Validation Error. Access Suspended.',
                        'code' => 'SECURITY_CHECK_ABORTED'
                    ], 401);
                }
            }
        }

        return $next($request);
    }
}
