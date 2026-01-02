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
                'message' => "Loan #{$loan->loan_no} is already repledged and is currently active.",
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

        $repledges = $query->latest()->paginate(20);
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
                    'status' => $validated['status'] ?? 'active',
                    'start_date' => $validated['start_date'] ?? null,
                    'end_date' => $validated['end_date'] ?? null,
                    'due_date' => $validated['due_date'] ?? null,
                ]);

                $repledge = Repledge::create($repledgeData);
                $createdRepledges[] = $repledge;

                // Increment balance of Money Source
                if (!empty($repledge->payment_method) && !empty($repledge->amount)) {
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
                                'description' => "Repledge Creation #{$repledge->id} (Loan: {$repledge->loan_no})",
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
                            'name' => $repledge->payment_method,
                            'repledge_id' => $repledge->id
                        ]);
                    }
                }
            }
        });

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

        return response()->json($repledge);
    }

    public function destroy(Repledge $repledge)
    {
        $this->authorize('delete', $repledge);
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
                'remarks' => $validated['remarks'],
                'status' => 'closed',
            ]);

            // 2. Handle Payment (Debit from Source) - Paying BACK the loan
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

            // 4. Update Repledge Status
            $repledge->update(['status' => 'closed']);

            return response()->json($closure);
        });
    }
}
