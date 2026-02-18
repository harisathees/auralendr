<?php

namespace App\Http\Controllers\Api\V1\Repledge;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Repledge\Repledge;
use App\Models\Pledge\Loan;
use App\Models\Admin\MoneySource\MoneySource;
use Illuminate\Http\Request;
use App\Http\Requests\Repledge\StoreRepledgeRequest;
use App\Http\Requests\Repledge\UpdateRepledgeRequest;
use Illuminate\Support\Facades\DB;

class RepledgeController extends Controller
{
    protected $activityService;

    public function __construct(\App\Services\ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function searchLoan(Request $request)
    {
        $user = $request->user();
        if (!$user->can('repledge.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $loanNo = trim($request->query('query'));
        // ... (rest of searchLoan logic)
        if (!$loanNo) {
            return response()->json([], 200);
        }

        // Use 'like' for case-insensitive/whitespace tolerance if DB collation allows, or just clean match.
        // Also ensure we eager load what we need.
        $loan = Loan::where('loan_no', $loanNo)
            ->whereHas('pledge', function ($query) use ($user) {
                if (!$user->hasRole('admin')) {
                    $query->where('branch_id', $user->branch_id);
                }
            })
            ->with(['pledge.jewels'])
            ->first();

        if (!$loan) {
            // Fallback: Try searching pledge by id if input looks like numeric ID (optional, but good for robust search)
            // Or try case-insensitive
            $loan = Loan::where('loan_no', 'LIKE', $loanNo)
                ->whereHas('pledge', function ($query) use ($user) {
                    if (!$user->hasRole('admin')) {
                        $query->where('branch_id', $user->branch_id);
                    }
                })
                ->with(['pledge.jewels'])
                ->with(['pledge']) // Ensure pledge relationship is loaded for branch check if needed inside (redundant with whereHas but safe)
                ->first();
        }

        if (!$loan) {
            return response()->json(['message' => 'Loan not found or access denied'], 404);
        }

        // Check if loan is already repledged
        $existingRepledge = Repledge::where('loan_id', $loan->id)
            ->where('status', 'active')
            ->first();

        if ($existingRepledge) {
            return response()->json([
                'message' => "Loan #{$loan->loan_no} is already bank pledged and is currently active.",
                'error' => 'loan_already_repledged'
            ], 400);
        }

        // Aggregate Weights
        // Ensure jewels exist
        $jewels = $loan->pledge->jewels ?? collect([]);
        $grossWeight = $jewels->sum('weight');
        $netWeight = $jewels->sum('net_weight');
        $stoneWeight = $jewels->sum('stone_weight');

        return response()->json([
            'id' => $loan->id,
            'loan_no' => $loan->loan_no,
            'amount' => $loan->amount,
            'gross_weight' => $grossWeight,
            'net_weight' => $netWeight,
            'stone_weight' => $stoneWeight,
            'jewels' => $jewels,
        ]);
    }

    public function index(Request $request)
    {
        if (!$request->user()->can('repledge.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $search = $request->query('search');

        $query = Repledge::with(['source', 'loan.pledge.customer']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('loan_no', 'like', "%{$search}%")
                    ->orWhere('re_no', 'like', "%{$search}%")
                    ->orWhereHas('source', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('loan.pledge.customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('mobile_no', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = (int) $request->query('per_page', 10);
        $repledges = $query->latest()->paginate($perPage);
        return response()->json($repledges);
    }

    public function store(StoreRepledgeRequest $request)
    {
        if (!$request->user()->can('repledge.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validated();

        $createdRepledges = [];

        DB::transaction(function () use ($validated, &$createdRepledges, $request) {
            // Process items in original order (1, 2, 3...)
            foreach ($validated['items'] as $item) {
                // Auto-link loan if not provided but loan_no exists (optional logic)
                if (empty($item['loan_id']) && !empty($item['loan_no'])) {
                    $loan = Loan::where('loan_no', $item['loan_no'])->first();
                    if ($loan) {
                        $item['loan_id'] = $loan->id;
                    }
                }

                // Merge common parent fields into item
                $repledgeData = array_merge($item, [
                    'repledge_source_id' => $validated['repledge_source_id'],
                    'branch_id' => $request->input('branch_id') ?? $request->user()->branch_id, // Capture branch_id
                    'status' => $validated['status'] ?? 'active',
                    'start_date' => $validated['start_date'] ?? null,
                    'end_date' => $validated['end_date'] ?? null,
                    'due_date' => $validated['due_date'] ?? null,
                ]);

                $repledge = Repledge::create($repledgeData);
                $createdRepledges[] = $repledge;

                // Increment balance of Money Source
                if (!empty($repledge->payment_method) && !empty($repledge->amount)) {
                    // Check if transactions are enabled
                    $transactionSetting = \App\Models\Settings::where('key', 'enable_transactions')
                        ->where(function ($q) use ($request, $repledge) {
                            $q->where('branch_id', $repledge->branch_id)
                                ->orWhereNull('branch_id');
                        })
                        ->orderByDesc('branch_id')
                        ->first();
                    $enableTransactions = $transactionSetting ? (bool) $transactionSetting->value : true;

                    if ($enableTransactions) {
                        $moneySource = MoneySource::where('name', $repledge->payment_method)->first();
                        if ($moneySource) {
                            if (!$moneySource->is_inbound) {
                                throw new \Exception("The selected payment method '{$moneySource->name}' is not allowed for inbound transactions.");
                            }

                            // Net inflow = Amount - Processing Fee
                            $netAmount = (float) $repledge->amount - (float) ($repledge->processing_fee ?? 0);

                            if ($netAmount > 0) {
                                $moneySource->increment('balance', $netAmount);

                                // Create Transaction Record
                                \App\Models\Transaction\Transaction::create([
                                    'branch_id' => $repledge->branch_id ?? $request->user()->branch_id,
                                    'money_source_id' => $moneySource->id,
                                    'type' => 'credit',
                                    'amount' => $netAmount,
                                    'date' => $repledge->start_date ?? now(),
                                    'description' => "Bank Pledge Creation #{$repledge->id} (Loan: {$repledge->loan_no})",
                                    'category' => 'repledge_credit',
                                    'transactionable_type' => Repledge::class,
                                    'transactionable_id' => $repledge->id,
                                    'created_by' => $request->user()->id,
                                ]);

                                \Illuminate\Support\Facades\Log::info('Repledge transaction recorded and source incremented', [
                                    'repledge_id' => $repledge->id,
                                    'source' => $moneySource->name,
                                    'incremented' => $netAmount,
                                    'new_balance' => $moneySource->balance
                                ]);
                            }
                        } else {
                            \Illuminate\Support\Facades\Log::warning('Money source not found for repledge increment', [
                                'repledge_id' => $repledge->id
                            ]);
                        }
                    } else {
                        \Illuminate\Support\Facades\Log::info('Transaction skipped for Repledge due to settings', ['repledge_id' => $repledge->id, 'enable_transactions' => $enableTransactions]);
                    }
                }
            }
        });

        foreach ($createdRepledges as $repledge) {
            $this->activityService->log('create', "Created Repledge (Loan: {$repledge->loan_no})", $repledge);
        }

        return response()->json($createdRepledges, 201);
    }

    public function show(Repledge $repledge)
    {
        $this->authorize('view', $repledge);
        return response()->json($repledge->load(['source', 'loan.pledge.customer.media', 'loan.pledge.jewels']));
    }

    public function update(UpdateRepledgeRequest $request, Repledge $repledge)
    {
        $this->authorize('update', $repledge);
        $validated = $request->validated();

        $repledge->update($validated);

        $this->activityService->log('update', "Updated Repledge (Loan: {$repledge->loan_no})", $repledge);

        return response()->json($repledge);
    }

    public function destroy(Repledge $repledge)
    {
        $this->authorize('delete', $repledge);

        try {
            $this->activityService->log('delete', "Deleted Repledge", $repledge);
        } catch (\Exception $e) {
        }

        $repledge->delete();
        return response()->json(null, 204);
    }

    /**
     * POST /api/repledges/{repledge}/close
     */
    public function close(Request $request, Repledge $repledge)
    {
        // $this->authorize('repledge.close'); // Use policy or permission

        $validated = $request->validate([
            'closed_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0', // Total Paid
            'principal_amount' => 'required|numeric|min:0',
            'interest_paid' => 'nullable|numeric|min:0',
            'payment_source_id' => 'required|exists:money_sources,id',
            'remarks' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $repledge, $request) {
            // 1. Create Closure Record
            $closure = \App\Models\Repledge\RepledgeClosure::create([
                'repledge_id' => $repledge->id,
                'created_by' => $request->user()->id,
                'closed_date' => $validated['closed_date'],
                'principal_amount' => $validated['principal_amount'],
                'interest_paid' => $validated['interest_paid'] ?? 0,
                'total_paid_amount' => $validated['amount_paid'],
                'remarks' => $validated['remarks'] ?? null,
                'status' => 'closed',
            ]);

            // 2. Handle Payment (Debit from Source) - Paying BACK the loan & Transactions if Enabled
            // Check if transactions are enabled
            $transactionSetting = \App\Models\Settings::where('key', 'enable_transactions')
                ->where(function ($q) use ($request) {
                    $q->where('branch_id', $request->user()->branch_id)
                        ->orWhereNull('branch_id');
                })
                ->orderByDesc('branch_id')
                ->first();
            $enableTransactions = $transactionSetting ? (bool) $transactionSetting->value : true;

            if ($enableTransactions) {
                $moneySource = MoneySource::lockForUpdate()->find($validated['payment_source_id']);

                // Check for outbound permission
                if (!$moneySource->is_outbound) {
                    throw new \Exception("Payment source '{$moneySource->name}' is not allowed for outbound payments.");
                }

                $moneySource->decrement('balance', $validated['amount_paid']);

                // 3. Create Transaction
                \App\Models\Transaction\Transaction::create([
                    'branch_id' => $request->user()->branch_id,
                    'money_source_id' => $moneySource->id,
                    'type' => 'debit', // Expense/Outflow
                    'amount' => $validated['amount_paid'],
                    'date' => $validated['closed_date'],
                    'description' => "Repledge Closure #{$repledge->id} (Loan: {$repledge->loan->loan_no})",
                    'category' => 'repledge_payment', // Ensure this category exists or is handled
                    'transactionable_type' => \App\Models\Repledge\RepledgeClosure::class,
                    'transactionable_id' => $closure->id,
                    'created_by' => $request->user()->id,
                ]);
            } else {
                \Illuminate\Support\Facades\Log::info('Transaction skipped for Repledge Closure due to settings', ['repledge_id' => $repledge->id, 'enable_transactions' => $enableTransactions]);
            }

            // 4. Update Repledge Status
            $repledge->update(['status' => 'closed']);

            // 5. Cleanup Notifications (Auto-resolve)
            try {
                // Find notifications related to this repledge and delete them
                DB::table('notifications')
                    ->where('type', 'App\Notifications\RepledgeClosurePending')
                    ->whereJsonContains('data->repledge_id', $repledge->id)
                    ->delete();
            } catch (\Exception $e) {
                // Log but don't fail the transaction
                \Illuminate\Support\Facades\Log::warning('Failed to cleanup notifications for repledge closure', ['repledge_id' => $repledge->id]);
            }

            $this->activityService->log('close', "Closed Repledge (Loan: {$repledge->loan->loan_no})", $repledge);

            return response()->json($closure);
        });
    }
}
