<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\pledge\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                    ->orWhere('last_name', 'LIKE', "%{$search}%")
                    ->orWhere('mobile_no', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(15);

        return response()->json($customers);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $customers = Customer::where('mobile_no', 'LIKE', "%{$query}%")
            ->orWhere('whatsapp_no', 'LIKE', "%{$query}%")
            ->orWhere('id_proof_number', 'LIKE', "%{$query}%")
            ->with([
                'media' => function ($q) {
                    $q->where('category', 'customer_document');
                }
            ])
            ->limit(5)
            ->get();

        // Transform to include URLs directly
        $customers->transform(function ($customer) {
            $doc = $customer->media->where('category', 'customer_document')->last();
            $customer->document_url = $doc ? url(Storage::url($doc->file_path)) : null;
            return $customer;
        });

        return response()->json($customers);
    }
}
