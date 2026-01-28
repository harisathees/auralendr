<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerLoanTrackController extends Controller
{
    public function check($tracking_code)
    {
        $track = \App\Models\CustomerApp\CustomerLoanTrack::where('tracking_code', $tracking_code)->first();

        if (!$track) {
            return response()->json(['status' => 'error', 'message' => 'Invalid Tracking Code'], 404);
        }

        // Middleware already validated "Enabled", so if we got here, it's valid.
        return response()->json(['status' => 'success', 'message' => 'Tracking Code Valid']);
    }

    public function track(\Illuminate\Http\Request $request, $tracking_code)
    {
        $request->validate([
            'last_4_digits' => 'required|digits:4',
        ]);

        $track = \App\Models\CustomerApp\CustomerLoanTrack::with(['loan.pledge.customer'])
            ->where('tracking_code', $tracking_code)
            ->first();

        // Middleware already checked enabling, but we explicitly check existence
        if (!$track) {
            abort(404);
        }

        $customer = $track->loan->pledge->customer ?? null;
        
        // Security Check
        if (!$customer || substr($customer->mobile_no, -4) !== $request->last_4_digits) {
            // Return 404 to avoid enumeration (as per requirements)
            abort(404);
        }

        $history = \App\Models\CustomerApp\CustomerLoanStatusLog::where('loan_id', $track->loan_id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'status' => $log->status_code,
                    'message' => $log->message,
                    'date' => $log->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'tracking_code' => $track->tracking_code,
                'current_status' => $track->loan->status,
                'loan_date' => $track->loan->date,
                'loan_no' => $track->loan->loan_no,
                'amount' => $track->loan->amount,
                'timeline' => $history
            ]
        ]);
    }

    /**
     * Return all pledges for the customer associated with the tracking code.
     * Auth: last 4 digits of mobile number.
     */
    public function allPledges(\Illuminate\Http\Request $request, $tracking_code)
    {
        $request->validate([
            'last_4_digits' => 'required|digits:4',
        ]);

        $track = \App\Models\CustomerApp\CustomerLoanTrack::with(['loan.pledge.customer'])
            ->where('tracking_code', $tracking_code)
            ->first();

        if (!$track) {
            abort(404);
        }

        $customer = $track->loan->pledge->customer ?? null;

        // Security Check
        if (!$customer || substr($customer->mobile_no, -4) !== $request->last_4_digits) {
            abort(404);
        }

        // Fetch all pledges for this customer
        $pledges = \App\Models\Pledge::with('loan')
            ->where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pledge) {
                return [
                    'id' => $pledge->id,
                    'loan_no' => $pledge->loan->loan_no ?? 'N/A',
                    'amount' => $pledge->loan->amount ?? 0,
                    'date' => $pledge->loan->date ?? null,
                    'status' => $pledge->status,
                    'tracking_code' => $pledge->loan->customerLoanTrack->tracking_code ?? null,
                ];
            });

        return response()->json([
            'status' => 'success',
            'customer_name' => $customer->name,
            'data' => $pledges,
        ]);
    }

}
