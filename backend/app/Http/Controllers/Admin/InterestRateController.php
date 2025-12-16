<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InterestRate;
use Illuminate\Http\Request;

class InterestRateController extends Controller
{
    public function index()
    {
        return InterestRate::with('jewelType:id,name')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'rate' => 'required|numeric',
            'estimation_percentage' => 'required|numeric|between:0,100',
            'jewel_type_id' => 'nullable|exists:jewel_types,id'
        ]);
        return InterestRate::create($request->all());
    }

    public function show(InterestRate $interestRate)
    {
        return $interestRate->load('jewelType');
    }

    public function update(Request $request, InterestRate $interestRate)
    {
        $request->validate([
            'rate' => 'required|numeric',
            'estimation_percentage' => 'required|numeric|between:0,100',
            'jewel_type_id' => 'nullable|exists:jewel_types,id'
        ]);
        $interestRate->update($request->all());
        return $interestRate;
    }

    public function destroy(InterestRate $interestRate)
    {
        $interestRate->delete();
        return response()->noContent();
    }
}
