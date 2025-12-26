<?php

namespace App\Http\Controllers\Api\V1\Transaction;

use App\Models\Transaction\Transaction;
use App\Models\Admin\MoneySource\MoneySource;
use App\Models\Pledge\PledgeClosure;
use App\Models\Pledge\Pledge;
use App\Models\Admin\Task\Task;
use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::with(['moneySource', 'creator.branch'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by branch if user is assigned to one AND is not an admin/superuser
        // This allows admins to see all transactions even if they have a branch_id assigned
        if ($user->branch_id && !$user->hasRole(['admin', 'superadmin', 'developer'])) {
            $query->where('branch_id', $user->branch_id);
        }

        // Allow explicit filtering by branch (e.g. for Admins)
        if ($request->has('branch_id') && $request->branch_id) {
            $query->where('branch_id', $request->branch_id);
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
            'pledge_id' => 'nullable|exists:pledges,id',
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

            // 3. Handle Pledge Balance (if linked)
            if (!empty($validated['pledge_id'])) {
                $pledgeId = $validated['pledge_id'];
                $pledgeClosure = PledgeClosure::where('pledge_id', $pledgeId)->first();

                if ($pledgeClosure) {
                    // Decrement balance (ensure it doesn't go below 0 purely for logic sanity, though DB might allow)
                    $paidAmount = $validated['amount'];
                    if ($validated['type'] === 'credit') { // Assuming credit means customer paid us
                        $pledgeClosure->decrement('balance_amount', $paidAmount);
                    }

                    // Check if balance is cleared
                    if ($pledgeClosure->fresh()->balance_amount <= 0) {
                        $pledgeClosure->update(['balance_amount' => 0]); // clean up negative values

                        // Find and Close Task
                        $pledge = Pledge::with('loan')->find($pledgeId);
                        if ($pledge && $pledge->loan) {
                            $loanNo = $pledge->loan->loan_no;
                            // Look for the specific task created by PledgeController
                            $task = Task::where('title', 'LIKE', "%Pending Balance: {$loanNo}%")
                                ->where('status', 'pending')
                                ->first();

                            if ($task) {
                                $task->update(['status' => 'completed']);
                                Log::info("Auto-completed task for pledge balance", ['task_id' => $task->id, 'pledge_id' => $pledgeId]);
                            }
                        }
                    }
                }
            }

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction' => $transaction->load('moneySource'),
                'new_balance' => $moneySource->balance
            ], 201);
        });
    }
}
