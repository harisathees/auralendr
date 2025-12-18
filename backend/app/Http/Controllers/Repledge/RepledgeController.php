<?php

namespace App\Http\Controllers\Repledge;

use App\Http\Controllers\Controller;
use App\Models\Repledge\Repledge;
use App\Models\Pledge\Loan;
use App\Models\MoneySource;
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
        if (!$request->user()->can('repledge.list')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $repledges = Repledge::with('source')->latest()->paginate(20);
        return response()->json($repledges);
    }

    public function store(StoreRepledgeRequest $request)
    {
        if (!$request->user()->can('repledge.create')) {
             return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validated();

        $createdRepledges = [];

        DB::transaction(function () use ($validated, &$createdRepledges) {
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

                            \Illuminate\Support\Facades\Log::info('Repledge money source balance incremented', [
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
        return response()->json($repledge->load('source', 'loan'));
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
}
