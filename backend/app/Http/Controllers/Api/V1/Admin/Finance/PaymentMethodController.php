<?php

namespace App\Http\Controllers\Api\V1\Admin\Finance;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Finance\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return PaymentMethod::all();
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:payment_methods,name']);
        return PaymentMethod::create($request->all());
    }

    public function show(PaymentMethod $paymentMethod)
    {
        return $paymentMethod;
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $request->validate(['name' => 'required|string|unique:payment_methods,name,' . $paymentMethod->id]);
        $paymentMethod->update($request->all());
        return $paymentMethod;
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();
        return response()->noContent();
    }
}
