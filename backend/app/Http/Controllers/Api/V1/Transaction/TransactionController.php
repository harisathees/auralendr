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
    protected $activityService;

    public function __construct(\App\Services\ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

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

        if ($request->has('start_date') && $request->start_date != '') {
            $query->whereDate('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date != '') {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $perPage = (int) $request->query('per_page', 10);
        $transactions = $query->paginate($perPage);

        return response()->json($transactions);
    }

    public function report(Request $request)
    {
        $user = $request->user();
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $moneySourceId = $request->money_source_id;
        $branchId = $request->branch_id;

        // 1. Calculate Opening Balance
        $opQuery = Transaction::query();

        // Apply branch restrictions same as index
        if ($user->branch_id && !$user->hasRole(['admin', 'superadmin', 'developer'])) {
            $opQuery->where('branch_id', $user->branch_id);
        }
        if ($branchId) {
            $opQuery->where('branch_id', $branchId);
        }
        if ($moneySourceId) {
            $opQuery->where('money_source_id', $moneySourceId);
        }

        if ($startDate) {
            $opQuery->whereDate('date', '<', $startDate);
        } else {
            // If no start date, opening balance is 0
            $opQuery->whereRaw('1 = 0');
        }

        $openingBalance = $opQuery->selectRaw('SUM(CASE WHEN type = "credit" THEN amount ELSE -amount END) as balance')
            ->value('balance') ?? 0;

        // 2. Fetch Transactions for the period
        $query = Transaction::with(['moneySource', 'creator.branch'])
            ->orderBy('date', 'asc')
            ->orderBy('created_at', 'asc');

        if ($user->branch_id && !$user->hasRole(['admin', 'superadmin', 'developer'])) {
            $query->where('branch_id', $user->branch_id);
        }
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($moneySourceId) {
            $query->where('money_source_id', $moneySourceId);
        }
        if ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }

        return response()->json([
            'opening_balance' => (float) $openingBalance,
            'transactions' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:credit,debit,transfer',
            'money_source_id' => 'required|exists:money_sources,id',
            'to_money_source_id' => 'required_if:type,transfer|exists:money_sources,id|different:money_source_id',
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
            'pledge_id' => 'nullable|exists:pledges,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = auth()->user();
            $amount = $validated['amount'];
            $date = $validated['date'];
            $description = $validated['description'];
            $category = $validated['category'] ?? 'general';

            if ($validated['type'] === 'transfer') {
                if (!$user->hasRole(['admin', 'superadmin', 'developer'])) {
                    return response()->json(['message' => 'Unauthorized. Only admins can perform transfers.'], 403);
                }

                $fromSource = MoneySource::lockForUpdate()->find($validated['money_source_id']);
                $toSource = MoneySource::lockForUpdate()->find($validated['to_money_source_id']);

                // 1. Debit from Source
                $debitTransaction = Transaction::create([
                    'amount' => $amount,
                    'type' => 'debit',
                    'money_source_id' => $fromSource->id,
                    'date' => $date,
                    'description' => $description . " (Transfer to {$toSource->name})",
                    'category' => 'transfer',
                    'created_by' => $user->id,
                    'branch_id' => $user->branch_id,
                ]);

                $fromSource->balance -= $amount;
                $fromSource->save();

                // 2. Credit to Source
                $creditTransaction = Transaction::create([
                    'amount' => $amount,
                    'type' => 'credit',
                    'money_source_id' => $toSource->id,
                    'date' => $date,
                    'description' => $description . " (Transfer from {$fromSource->name})",
                    'category' => 'transfer',
                    'created_by' => $user->id,
                    'branch_id' => $user->branch_id,
                ]);

                $toSource->balance += $amount;
                $toSource->save();

                $this->activityService->log('create', "Created Transfer: {$amount} from {$fromSource->name} to {$toSource->name}", $debitTransaction);

                return response()->json([
                    'message' => 'Transfer completed successfully',
                    'debit_transaction' => $debitTransaction,
                    'credit_transaction' => $creditTransaction
                ], 201);
            }

            // Standard Transaction Logic
            $transaction = Transaction::create([
                'amount' => $amount,
                'type' => $validated['type'],
                'money_source_id' => $validated['money_source_id'],
                'date' => $date,
                'description' => $description,
                'category' => $category,
                'created_by' => $user->id,
                'branch_id' => $user->branch_id,
            ]);

            $moneySource = MoneySource::lockForUpdate()->find($validated['money_source_id']);

            if ($validated['type'] === 'credit') {
                $moneySource->balance += $amount;
            } else {
                $moneySource->balance -= $amount;
            }

            $moneySource->save();

            // 3. Handle Pledge Balance (if linked)
            if (!empty($validated['pledge_id'])) {
                $pledgeId = $validated['pledge_id'];
                $pledgeClosure = PledgeClosure::where('pledge_id', $pledgeId)->first();

                if ($pledgeClosure) {
                    if ($validated['type'] === 'credit') {
                        $pledgeClosure->decrement('balance_amount', $amount);
                    }

                    if ($pledgeClosure->fresh()->balance_amount <= 0) {
                        $pledgeClosure->update(['balance_amount' => 0]);
                        $pledge = Pledge::with('loan')->find($pledgeId);
                        if ($pledge && $pledge->loan) {
                            $loanNo = $pledge->loan->loan_no;
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

            $this->activityService->log('create', "Created Transaction: {$validated['type']} of {$amount} ({$description})", $transaction);

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction' => $transaction->load('moneySource'),
                'new_balance' => $moneySource->balance
            ], 201);
        });
    }
}
