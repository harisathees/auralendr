<?php

namespace App\Http\Controllers\Api\V1\Transaction;

use App\Models\Transaction\Transaction;
use App\Models\Admin\MoneySource\MoneySource;
use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::with(['moneySource', 'creator'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by branch if user is assigned to one
        if ($user->branch_id) {
            $query->whereHas('creator', function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            });
        }

        if ($request->has('money_source_id') && $request->money_source_id != '') {
            $query->where('money_source_id', $request->money_source_id);
        }

        $transactions = $query->paginate(50);

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:credit,debit',
            'money_source_id' => 'required|exists:money_sources,id',
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create Transaction
            $transaction = Transaction::create([
                'amount' => $validated['amount'],
                'type' => $validated['type'],
                'money_source_id' => $validated['money_source_id'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'category' => $validated['category'] ?? 'general',
                'created_by' => auth()->id(),
                'branch_id' => auth()->user()->branch_id,
                // 'transactionable' can be null for manual entries
            ]);

            // 2. Update Money Source Balance
            $moneySource = MoneySource::lockForUpdate()->find($validated['money_source_id']);

            if ($validated['type'] === 'credit') {
                $moneySource->balance += $validated['amount'];
            } else {
                $moneySource->balance -= $validated['amount'];
            }

            $moneySource->save();

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction' => $transaction->load('moneySource'),
                'new_balance' => $moneySource->balance
            ], 201);
        });
    }
}
