<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeveloperSettingsController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $branchId = $request->query('branch_id');

        // Treat 'null' string as null
        if ($branchId === 'null')
            $branchId = null;

        $query = \App\Models\Settings::where('key', 'enable_customer_app');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        } else {
            $query->whereNull('branch_id');
        }

        $setting = $query->first();

        return response()->json([
            'enable_customer_app' => $setting ? (bool) $setting->value : false
        ]);
    }

    public function update(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'enable_customer_app' => 'required|boolean'
        ]);

        \App\Models\Settings::updateOrCreate(
            [
                'key' => 'enable_customer_app',
                'branch_id' => $request->branch_id
            ],
            [
                'value' => $request->enable_customer_app ? '1' : '0'
            ]
        );

        return response()->json(['status' => 'success', 'message' => 'Settings updated successfully']);
    }
}
