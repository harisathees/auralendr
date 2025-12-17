<?php

namespace App\Http\Controllers\Repledge;

use App\Http\Controllers\Controller;
use App\Models\Repledge\RepledgeBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RepledgeBankController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(RepledgeBank::with('branches')->get());
        }

        if ($user->branch_id) {
            return response()->json(RepledgeBank::whereHas('branches', function ($q) use ($user) {
                $q->where('branches.id', $user->branch_id);
            })->get());
        }

        return response()->json([]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'branch' => 'nullable|string|max:255',
            'default_interest' => 'nullable|numeric|min:0',
            'validity_months' => 'nullable|integer|min:0',
            'post_validity_interest' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id'
        ]);

        // Remove branch_ids from data to be saved in repledge_banks table
        $bankData = collect($validated)->except(['branch_ids'])->toArray();
        $bank = RepledgeBank::create($bankData);

        if (isset($validated['branch_ids'])) {
            $bank->branches()->sync($validated['branch_ids']);
        }

        return response()->json($bank->load('branches'), 201);
    }

    public function show(RepledgeBank $repledgeBank)
    {
        return response()->json($repledgeBank->load('branches'));
    }

    public function update(Request $request, RepledgeBank $repledgeBank)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'branch' => 'nullable|string|max:255',
            'default_interest' => 'nullable|numeric|min:0',
            'validity_months' => 'nullable|integer|min:0',
            'post_validity_interest' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id'
        ]);

        // Remove branch_ids from data to be saved in repledge_banks table
        $bankData = collect($validated)->except(['branch_ids'])->toArray();
        $repledgeBank->update($bankData);

        if (isset($validated['branch_ids'])) {
            $repledgeBank->branches()->sync($validated['branch_ids']);
        }

        return response()->json($repledgeBank->load('branches'));
    }

    public function destroy(RepledgeBank $repledgeBank)
    {
        $repledgeBank->delete();
        return response()->json(null, 204);
    }
}
