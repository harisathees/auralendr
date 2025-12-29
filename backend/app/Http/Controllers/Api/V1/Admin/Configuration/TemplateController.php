<?php

namespace App\Http\Controllers\Api\V1\Admin\Configuration;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    /**
     * Get Receipt Template Settings
     */
    public function getReceiptTemplate(Request $request)
    {
        // Try to get branch specific settings first if user has branch
        $branchId = $request->user()->branch_id;

        $setting = Settings::where('key', 'receipt_template_config')
            ->where(function ($q) use ($branchId) {
                if ($branchId) {
                    $q->where('branch_id', $branchId)
                        ->orWhereNull('branch_id');
                } else {
                    $q->whereNull('branch_id');
                }
            })
            ->orderByDesc('branch_id') // Prefer branch specific
            ->first();

        $config = $setting ? json_decode($setting->value, true) : null;

        // Default Configuration
        if (!$config) {
            $config = [
                'type' => 'standard', // standard | dynamic
                'size' => 'A4',       // A4 | A5 | A6 | Thermal
                'alignment' => 'left', // left | center | right
                'title' => 'RECEIPT',
                'header' => '',
                'footer' => 'Thank you for your business!',
                'show_logo' => true,
            ];
        }

        return response()->json($config);
    }

    /**
     * Update Receipt Template Settings
     */
    public function updateReceiptTemplate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:standard,dynamic',
            'size' => 'required_if:type,dynamic|in:A4,A5,A6,Thermal',
            'alignment' => 'required_if:type,dynamic|in:left,center,right',
            'title' => 'nullable|string|max:100',
            'header' => 'nullable|string|max:500',
            'footer' => 'nullable|string|max:500',
            'show_logo' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $branchId = $request->user()->branch_id; // Or null for global admin

        // For now, we are storing global settings if admin, or branch specific if needed.
        // Assuming this config is currently global for the organization/branch context

        // Check if setting exists
        $setting = Settings::where('key', 'receipt_template_config')
            ->where('branch_id', $branchId)
            ->first();

        if (!$setting) {
            $setting = new Settings();
            $setting->key = 'receipt_template_config';
            $setting->branch_id = $branchId;
        }

        $setting->value = json_encode($request->only([
            'type',
            'size',
            'alignment',
            'title',
            'header',
            'footer',
            'show_logo'
        ]));

        $setting->save();

        return response()->json(['message' => 'Receipt template updated successfully', 'config' => json_decode($setting->value)]);
    }
}
