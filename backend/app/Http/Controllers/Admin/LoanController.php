<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\pledge\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with([
            'pledge.customer',
            'pledge.branch',
            'pledge.user' // Assuming 'user' relationship exists in Pledge model for 'created_by'
        ]);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('loan_no', 'like', "%{$search}%")
                ->orWhereHas('pledge.customer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile_no', 'like', "%{$search}%");
                });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $loans = $query->latest()->paginate(10);

        return response()->json($loans);
    }
}
