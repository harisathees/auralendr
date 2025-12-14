<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\pledge\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $customers = Customer::where('mobile_no', 'LIKE', "%{$query}%")
            ->orWhere('whatsapp_no', 'LIKE', "%{$query}%")
            ->orWhere('id_proof_number', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        return response()->json($customers);
    }
}
