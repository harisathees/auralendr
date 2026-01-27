<?php

namespace App\Http\Controllers\Api\V1\Admin\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                    ->orWhere('last_name', 'LIKE', "%{$search}%")
                    ->orWhere('mobile_no', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $customers = $query->latest()->paginate($perPage);

        return response()->json($customers);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $customers = Customer::where('mobile_no', 'LIKE', "%{$query}%")
            ->orWhere('whatsapp_no', 'LIKE', "%{$query}%")
            ->orWhere('id_proof_number', 'LIKE', "%{$query}%")
            ->with([
                'media' => function ($q) {
                    $q->where('category', 'customer_document');
                }
            ])
            ->limit(5)
            ->get();

        // Transform to include URLs directly
        $customers->transform(function ($customer) {
            $doc = $customer->media->where('category', 'customer_document')->last();
            $customer->document_url = $doc ? url(Storage::url($doc->file_path)) : null;
            return $customer;
        });

        return response()->json($customers);
    }

    public function analysis($id)
    {
        $customer = Customer::findOrFail($id);

        // Active Pledges & Overdue
        $activePledgesQuery = $customer->pledges()->where('status', 'active');
        $activePledgesCount = $activePledgesQuery->count();
        $activePledges = $activePledgesQuery->with(['loan', 'jewels'])->get();

        $activePledgesAmount = $activePledges->sum(function ($pledge) {
            return $pledge->loan ? $pledge->loan->amount : 0;
        });

        $overduePledgesCount = $activePledges->filter(function ($pledge) {
            return $pledge->loan && $pledge->loan->due_date < now();
        })->count();

        // Total Gold Weight (Active)
        $totalGoldWeight = $activePledges->sum(function ($pledge) {
            return $pledge->jewels->sum('net_weight');
        });

        // Closed Pledges & Interest
        $closedPledgesQuery = $customer->pledges()->where('status', 'closed');
        $closedPledgesCount = $closedPledgesQuery->count();
        $totalInterestPaid = $closedPledgesQuery->with('closure')->get()->sum(function ($pledge) {
            if ($pledge->closure) {
                return $pledge->closure->calculated_interest - ($pledge->closure->interest_reduction ?? 0);
            }
            return 0;
        });

        // Default Pledges
        $defaultPledgesCount = $customer->pledges()->where('status', 'default')->count();

        // Customer Since
        $customerSince = $customer->pledges()->orderBy('created_at', 'asc')->value('created_at');

        // Lifetime Loan Amount
        $lifetimeLoanAmount = $customer->pledges()->with('loan')->get()->sum(function ($pledge) {
            return $pledge->loan ? $pledge->loan->amount : 0;
        });

        return response()->json([
            'active_pledges_count' => $activePledgesCount,
            'active_pledges_amount' => $activePledgesAmount,
            'overdue_pledges_count' => $overduePledgesCount + $defaultPledgesCount, // active overdue + already defaulted
            'total_gold_weight' => $totalGoldWeight,
            'closed_pledges_count' => $closedPledgesCount,
            'total_interest_paid' => $totalInterestPaid,
            'default_pledges_count' => $defaultPledgesCount,
            'customer_since' => $customerSince,
            'lifetime_loan_amount' => $lifetimeLoanAmount
        ]);
    }
}
