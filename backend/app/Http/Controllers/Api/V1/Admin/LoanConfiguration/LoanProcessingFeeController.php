<?php

namespace App\Http\Controllers\Api\V1\Admin\LoanConfiguration;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\LoanConfiguration\LoanProcessingFee;
use Illuminate\Http\Request;

class LoanProcessingFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = LoanProcessingFee::query();

        if ($request->has('branch_id')) {
            if ($request->branch_id === 'null' || is_null($request->branch_id)) {
                $query->whereNull('branch_id');
            } else {
                $query->where('branch_id', $request->branch_id);
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jewel_type_id' => 'required|exists:jewel_types,id',
            'branch_id' => 'nullable|exists:branches,id',
            'percentage' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        $fee = LoanProcessingFee::updateOrCreate(
            [
                'jewel_type_id' => $validated['jewel_type_id'],
                'branch_id' => $validated['branch_id'],
            ],
            [
                'percentage' => $validated['percentage'],
                'max_amount' => $validated['max_amount'],
            ]
        );

        return response()->json($fee);
    }
}
