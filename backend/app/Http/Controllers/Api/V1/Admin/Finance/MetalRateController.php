<?php

namespace App\Http\Controllers\Api\V1\Admin\Finance;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\JewelManagement\JewelType;
use App\Models\Admin\Finance\MetalRate;
use Illuminate\Http\Request;

class MetalRateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch all jewel types with their current metal rate
        $rates = JewelType::with('metalRate')->get();
        return response()->json($rates);
    }

    /**
     * Store or update the rate for a specific jewel type.
     */
    public function store(Request $request)
    {
        $request->validate([
            'jewel_type_id' => 'required|exists:jewel_types,id',
            'rate' => 'required|numeric|min:0',
        ]);

        $existingRate = MetalRate::where('jewel_type_id', $request->jewel_type_id)->first();

        $data = ['rate' => $request->rate];

        if ($existingRate) {
            $data['previous_rate'] = $existingRate->rate;
        }

        $rate = MetalRate::updateOrCreate(
            ['jewel_type_id' => $request->jewel_type_id],
            $data
        );

        return response()->json([
            'message' => 'Metal rate updated successfully.',
            'data' => $rate
        ]);
    }
}
