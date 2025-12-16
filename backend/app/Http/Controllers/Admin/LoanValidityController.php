<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoanValidity;
use Illuminate\Http\Request;

class LoanValidityController extends Controller
{
    public function index()
    {
        return LoanValidity::with('jewelType:id,name')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'months' => 'required|integer',
            'label' => 'nullable|string',
            'jewel_type_id' => 'nullable|exists:jewel_types,id'
        ]);
        return LoanValidity::create($request->all());
    }

    public function show(LoanValidity $loanValidity)
    {
        return $loanValidity->load('jewelType');
    }

    public function update(Request $request, LoanValidity $loanValidity)
    {
        $request->validate([
            'months' => 'required|integer',
            'label' => 'nullable|string',
            'jewel_type_id' => 'nullable|exists:jewel_types,id'
        ]);
        $loanValidity->update($request->all());
        return $loanValidity;
    }

    public function destroy(LoanValidity $loanValidity)
    {
        $loanValidity->delete();
        return response()->noContent();
    }
}
