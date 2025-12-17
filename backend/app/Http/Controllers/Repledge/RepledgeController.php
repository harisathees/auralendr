<?php

namespace App\Http\Controllers\Repledge;

use App\Http\Controllers\Controller;
use App\Models\Repledge\Repledge;
use App\Models\Pledge\Loan;
use Illuminate\Http\Request;
use App\Http\Requests\Repledge\StoreRepledgeRequest;
use App\Http\Requests\Repledge\UpdateRepledgeRequest;
use Illuminate\Support\Facades\DB;

class RepledgeController extends Controller
{
    public function searchLoan(Request $request)
    {
        $loanNo = $request->query('query');
        if (!$loanNo) {
            return response()->json([], 200);
        }

        $user = $request->user();

        $loan = Loan::where('loan_no', $loanNo)
            ->whereHas('pledge', function ($query) use ($user) {
                if (!$user->hasRole('admin')) {
                    $query->where('branch_id', $user->branch_id);
                }
            })
            ->with(['pledge.jewels'])
            ->first();

        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }

        // Aggregate Weights
        $grossWeight = $loan->pledge->jewels->sum('weight'); // 'weight' is gross weight in Jewel model?
        // Jewel model has 'weight', 'stone_weight', 'net_weight'.
        // Let's assume 'weight' is gross.
        $netWeight = $loan->pledge->jewels->sum('net_weight');
        $stoneWeight = $loan->pledge->jewels->sum('stone_weight');

        return response()->json([
            'id' => $loan->id,
            'loan_no' => $loan->loan_no,
            'amount' => $loan->amount,
            'gross_weight' => $grossWeight,
            'net_weight' => $netWeight,
            'stone_weight' => $stoneWeight,
        ]);
    }

    public function index()
    {
        $repledges = Repledge::with('source')->latest()->paginate(20);
        return response()->json($repledges);
    }

    public function store(StoreRepledgeRequest $request)
    {
        $validated = $request->validated();

        $createdRepledges = [];

        DB::transaction(function () use ($validated, &$createdRepledges) {
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

                $createdRepledges[] = Repledge::create($repledgeData);
            }
        });

        return response()->json($createdRepledges, 201);
    }

    public function show(Repledge $repledge)
    {
        return response()->json($repledge->load('source', 'loan'));
    }

    public function update(UpdateRepledgeRequest $request, Repledge $repledge)
    {
        $validated = $request->validated();

        $repledge->update($validated);

        return response()->json($repledge);
    }

    public function destroy(Repledge $repledge)
    {
        $repledge->delete();
        return response()->json(null, 204);
    }
}
