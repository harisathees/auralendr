<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * GET /api/transactions
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::with(['moneySource', 'transactionable']);

        // Staff sees only their branch transactions
        if (!$user->hasRole('admin')) {
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        try {
            return response()->json($query->orderByDesc('date')->orderByDesc('id')->paginate(20));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Transaction Fetch Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch transactions',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
