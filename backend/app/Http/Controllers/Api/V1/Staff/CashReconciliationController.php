<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Staff\CashReconciliation;
use App\Models\Admin\MoneySource\MoneySource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashReconciliationController extends Controller
{
    /**
     * Get today's reconciliation status and system expected amount.
     */
    public function today(Request $request)
    {
        $user = $request->user();
        $date = now()->toDateString();

        // 1. Check if already reconciled for today
        $existing = CashReconciliation::where('branch_id', $user->branch_id)
            ->whereDate('date', $date)
            ->first();

        // 2. Calculate System Expected Amount (Cash Balance)
        // Find MoneySource of type 'cash' for this branch
        // Assuming 'Cash' is the name or type. Let's look for type='cash' linked to branch
        $cashSource = MoneySource::whereHas('branches', function ($q) use ($user) {
            $q->where('branches.id', $user->branch_id);
        })->where('type', 'cash')->first();

        // Fallback: if no branch-specific cash source, try global 'Cash' (legacy support)
        if (!$cashSource) {
            $cashSource = MoneySource::where('type', 'cash')->whereDoesntHave('branches')->first();
        }

        // If still not found, try by name 'Cash'
        if (!$cashSource) {
            $cashSource = MoneySource::where('name', 'Cash')->first();
        }

        $systemExpected = $cashSource ? $cashSource->balance : 0;

        return response()->json([
            'date' => $date,
            'is_reconciled' => !!$existing,
            'reconciliation' => $existing,
            'system_expected_amount' => $systemExpected,
            'branch_id' => $user->branch_id,
        ]);
    }

    /**
     * Store reconciliation report.
     */
    public function store(Request $request)
    {
        $request->validate([
            'physical_amount' => 'required|numeric|min:0',
            'denominations' => 'required|array',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $date = now()->toDateString();

        // Prevent duplicate
        if (CashReconciliation::where('branch_id', $user->branch_id)->whereDate('date', $date)->exists()) {
            return response()->json(['message' => 'Reconciliation already submitted for today.'], 409);
        }

        // Re-fetch system expected to ensure accuracy at moment of submission
        $cashSource = MoneySource::whereHas('branches', function ($q) use ($user) {
            $q->where('branches.id', $user->branch_id);
        })->where('type', 'cash')->first();

        if (!$cashSource) {
            $cashSource = MoneySource::where('name', 'Cash')->first();
        }

        $systemExpected = $cashSource ? $cashSource->balance : 0;
        $physical = $request->physical_amount;
        $difference = $physical - $systemExpected;

        $reconciliation = CashReconciliation::create([
            'branch_id' => $user->branch_id,
            'user_id' => $user->id,
            'date' => $date,
            'system_expected_amount' => $systemExpected,
            'physical_amount' => $physical,
            'difference' => $difference,
            'denominations' => $request->denominations,
            'notes' => $request->notes,
            'status' => 'closed', // Auto-close for now, or 'pending' if double-check needed
        ]);

        return response()->json([
            'message' => 'Cash reconciliation submitted successfully.',
            'data' => $reconciliation
        ], 201);
    }

    /**
     * Get history of reconciliations.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $history = CashReconciliation::with('user:id,name')
            ->where('branch_id', $user->branch_id)
            ->orderByDesc('date')
            ->paginate(10);

        return response()->json($history);
    }
}
