<?php

namespace App\Http\Controllers\Repledge;

use App\Http\Controllers\Controller;
use App\Models\Repledge\RepledgeBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RepledgeBankController extends Controller
{
    public function index()
    {
        return response()->json(RepledgeBank::all());
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
        ]);

        $bank = RepledgeBank::create($validated);

        return response()->json($bank, 201);
    }

    public function show(RepledgeBank $repledgeBank)
    {
        return response()->json($repledgeBank);
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
        ]);

        $repledgeBank->update($validated);

        return response()->json($repledgeBank);
    }

    public function destroy(RepledgeBank $repledgeBank)
    {
        $repledgeBank->delete();
        return response()->json(null, 204);
    }
}
