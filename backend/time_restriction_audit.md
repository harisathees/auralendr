# Time Restriction & Auto-Logout System Audit & Fix

## 1. Backend Implementation (Security Critical)

The backend is the single source of truth. We implemented a robust middleware that enforces time restrictions on every request.

### Middleware Code (`app/Http/Middleware/StaffLoginTime/CheckLoginTime.php`)
This middleware runs on every authenticated request for staff. It validates the current time against the allowed window in the correct timezone, and **revokes all tokens** if the check fails.

```php
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
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('staff')) {
            $branchId = $user->branch_id;
            
            // 1. Fetch Settings (Global + Branch Override strategy)
            $keys = ['access_start_time', 'access_end_time', 'timezone'];
            
            $settings = StaffTimeRestriction::whereIn('key', $keys)
                ->where(function($q) use ($branchId) {
                    $q->where('branch_id', $branchId)
                      ->orWhereNull('branch_id');
                })
                ->get();

            // Helper to resolve value (Branch > Global)
            $getValue = function($key) use ($settings, $branchId) {
                $branchSpecific = $settings->where('key', $key)->where('branch_id', $branchId)->first();
                if ($branchSpecific && !empty($branchSpecific->value)) return $branchSpecific->value;
                
                $global = $settings->where('key', $key)->whereNull('branch_id')->first();
                return $global ? $global->value : null;
            };

            $startStr = $getValue('access_start_time');
            $endStr = $getValue('access_end_time');
            $timezone = $getValue('timezone') ?? config('app.timezone');

            if ($startStr && $endStr) {
                try {
                    $now = Carbon::now($timezone);
                    $startTime = Carbon::createFromFormat('H:i', $startStr, $timezone);
                    $endTime = Carbon::createFromFormat('H:i', $endStr, $timezone);
                    
                    // Normalize dates to today
                    $startTime->setDate($now->year, $now->month, $now->day);
                    $endTime->setDate($now->year, $now->month, $now->day);

                    if (!$now->between($startTime, $endTime)) {
                        // CRITICAL: Revoke ALL tokens to kill sessions on other devices too
                        $user->tokens()->delete();

                        return response()->json([
                            'message' => 'Access Denied: Your login session is outside of allowed working hours.',
                            'code' => 'TIME_RESTRICTION_EXPIRED'
                        ], 401);
                    }
                } catch (\Exception $e) {
                    Log::error("Time Restriction Check Error: " . $e->getMessage());
                    // Fail Closed
                    $user->tokens()->delete();
                    return response()->json(['message' => 'Security Validation Error.'], 401);
                }
            }
        }

        return $next($request);
    }
}
```

### Kernel Registration (`bootstrap/app.php`)
The middleware is aliased for use in routes.

```php
        $middleware->alias([
            // ...
            'check.time' => \App\Http\Middleware\StaffLoginTime\CheckLoginTime::class,
        ]);
```

### API Route Grouping (`routes/api.php`)
We apply the middleware to the authenticated group.

```php
Route::middleware(['auth:sanctum', 'check.time'])->group(function () {
    // All protected routes...
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    // ...
});
```

---

## 2. Frontend Implementation (UX Layer)

The frontend handles the 401 response and ensures a smooth logout experience.

### Global Axios Interceptor (`src/api/apiClient.ts`)
We intercept `401 Unauthorized` and `419 Page Expired` to force a client-side logout.

```typescript
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Unauthorized (401) or Token Expired (419) → Global Logout
    if (status === 401 || status === 419) {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect if not already on login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      
      return Promise.reject(error);
    }
    // ...
```

---

## 3. Security vs UX Breakdown

| Feature | Type | Responsibility |
| :--- | :--- | :--- |
| **Token Revocation** | **Security Critical** | Backend destroys the valid session in the database. Even if the user manually sets a token in the frontend, it will be rejected. |
| **Time Validation** | **Security Critical** | Backend validates time on *every* request. Prevents race conditions or "staying logged in". |
| **401/403 Responses** | **Security Critical** | Backend returns proper error codes, never exposing data when unauthorized. |
| **Redirect to Login** | **UX Only** | Frontend simply reacts to the 401. This is for user convenience, not security. |
| **Clearing LocalStorage**| **UX Only** | Removes stale data from the browser. The strict security is enforced by the token being invalid on the server. |
