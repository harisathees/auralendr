<?php

namespace App\Http\Controllers\Api\V1\Admin\LoanConfiguration;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\LoanConfiguration\RepledgeFee;
use Illuminate\Http\Request;

class RepledgeFeeController extends Controller
{
    public function index()
    {
        return response()->json(RepledgeFee::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jewel_type_id' => 'required|exists:jewel_types,id',
            'percentage' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        $fee = RepledgeFee::updateOrCreate(
            [
                'jewel_type_id' => $validated['jewel_type_id'],
            ],
            [
                'percentage' => $validated['percentage'],
                'max_amount' => $validated['max_amount'],
            ]
        );

        return response()->json($fee);
    }
}
