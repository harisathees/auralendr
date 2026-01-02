<?php

namespace App\Http\Controllers\Api\V1\Admin\LoanConfiguration;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with([
            'pledge.customer',
            'pledge.branch',
            'pledge.user' // Assuming 'user' relationship exists in Pledge model for 'created_by'
        ]);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('loan_no', 'like', "%{$search}%")
                ->orWhereHas('pledge.customer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile_no', 'like', "%{$search}%");
                });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $loans = $query->latest()->paginate(10);

        return response()->json($loans);
    }

    public function showByLoanNo($loanNo)
    {
        $loan = Loan::where('loan_no', $loanNo)
            ->with(['pledge.customer', 'pledge.jewels', 'pledge.branch', 'pledge.user'])
            ->first();

        if (!$loan) {
            // Try case-insensitive
            $loan = Loan::where('loan_no', 'LIKE', $loanNo)
                ->with(['pledge.customer', 'pledge.jewels', 'pledge.branch', 'pledge.user'])
                ->first();
        }

        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }

        // Apply same branch restriction if not admin
        $user = auth()->user();
        if ($user && !$user->hasRole(['admin', 'superadmin', 'developer'])) {
            if ($loan->pledge->branch_id !== $user->branch_id) {
                return response()->json(['message' => 'Access Denied'], 403);
            }
        }

        // Return in structured format expected by useRepledge.ts
        return response()->json([
            'loan' => $loan,
            'totals' => [
                'net_weight' => (float) $loan->pledge->jewels->sum('net_weight'),
                'gross_weight' => (float) $loan->pledge->jewels->sum('weight'),
                'stone_weight' => (float) $loan->pledge->jewels->sum('stone_weight'),
            ]
        ]);
    }
}
