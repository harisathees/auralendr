<?php

namespace App\Http\Controllers\Repledge;

use App\Http\Controllers\Controller;
use App\Models\Repledge\RepledgeSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RepledgeSourceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(RepledgeSource::with('branches')->get());
        }

        if ($user->branch_id) {
            return response()->json(RepledgeSource::whereHas('branches', function ($q) use ($user) {
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

        // Remove branch_ids from data to be saved in table
        $sourceData = collect($validated)->except(['branch_ids'])->toArray();
        $source = RepledgeSource::create($sourceData);

        if (isset($validated['branch_ids'])) {
            $source->branches()->sync($validated['branch_ids']);
        }

        return response()->json($source->load('branches'), 201);
    }

    public function show(RepledgeSource $repledgeSource)
    {
        return response()->json($repledgeSource->load('branches'));
    }

    public function update(Request $request, RepledgeSource $repledgeSource)
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

        // Remove branch_ids from data to be saved in table
        $sourceData = collect($validated)->except(['branch_ids'])->toArray();
        $repledgeSource->update($sourceData);

        if (isset($validated['branch_ids'])) {
            $repledgeSource->branches()->sync($validated['branch_ids']);
        }

        return response()->json($repledgeSource->load('branches'));
    }

    public function destroy(RepledgeSource $repledgeSource)
    {
        $repledgeSource->delete();
        return response()->json(null, 204);
    }
}
