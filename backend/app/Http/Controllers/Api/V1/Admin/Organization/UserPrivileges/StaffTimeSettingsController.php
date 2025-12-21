<?php

namespace App\Http\Controllers\Api\V1\Admin\Organization\UserPrivileges;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Organization\UserPrivileges\StaffTimeRestriction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StaffTimeRestrictionController extends Controller
{
    /**
     * Get settings by group or all
     */
    public function index(Request $request)
    {
        $query = StaffTimeRestriction::query();

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        // 1. Fetch Global Settings
        $globalQuery = clone $query;
        $globalSettings = $globalQuery->whereNull('branch_id')->get()->pluck('value', 'key');

        // 2. Fetch Branch Settings (if requested)
        if ($request->has('branch_id') && $request->branch_id !== 'null' && $request->branch_id !== '') {
             $branchSettings = $query->where('branch_id', $request->branch_id)->get()->pluck('value', 'key');
             // Branch overrides Global
             $settings = $globalSettings->merge($branchSettings);
        } else {
             $settings = $globalSettings;
        }

        return response()->json($settings);
    }

    /**
     * Update settings (batch)
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'group' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group = $request->input('group', 'general');
        $branchId = $request->input('branch_id'); // Can be null
        // Ensure consistent null if empty
        if ($branchId === '' || $branchId === 'null') $branchId = null;

        $settings = $request->input('settings');

        foreach ($settings as $key => $value) {
            StaffTimeRestriction::updateOrCreate(
                [
                    'key' => $key,
                    'branch_id' => $branchId
                ],
                [
                    'value' => $value,
                    'group' => $group
                ]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
