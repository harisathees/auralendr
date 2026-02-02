<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerAppEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $trackingCode = $request->route('tracking_code');

        if (!$trackingCode) {
            // If checking route that doesn't have tracking_code, maybe valid (e.g. general settings?)
            // But specified for customer routes which are track/{code}.
            // If global route, blocked.
            abort(404);
        }

        $track = \App\Models\CustomerApp\CustomerLoanTrack::with('branch')->where('tracking_code', $trackingCode)->first();

        if (!$track) {
            abort(404);
        }

        // Check Branch Settings directly from the branch relationship
        $isEnabled = $track->branch ? $track->branch->enable_customer_app : false;

        // Check if value is truthy (1, "1", true, "true")
        if (!filter_var($isEnabled, FILTER_VALIDATE_BOOLEAN)) {
            abort(404);
        }

        return $next($request);
    }
}
