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

        $settings = \App\Models\Settings::whereIn('key', ['enable_customer_app', 'enable_transactions', 'enable_tasks', 'enable_receipt_print', 'enable_estimated_amount', 'enable_bank_pledge', 'no_branch_mode', 'enable_approvals'])
            ->where(function ($query) use ($branchId) {
                if ($branchId) {
                    $query->where('branch_id', $branchId);
                } else {
                    $query->whereNull('branch_id');
                }
            })
            ->get()
            ->keyBy('key');


        return response()->json([
            'enable_customer_app' => isset($settings['enable_customer_app']) ? (bool) $settings['enable_customer_app']->value : false,
            'enable_transactions' => isset($settings['enable_transactions']) ? (bool) $settings['enable_transactions']->value : false, // Default to false
            'enable_tasks' => isset($settings['enable_tasks']) ? (bool) $settings['enable_tasks']->value : false, // Default to false
            'enable_receipt_print' => isset($settings['enable_receipt_print']) ? (bool) $settings['enable_receipt_print']->value : false, // Default to false
            'enable_estimated_amount' => isset($settings['enable_estimated_amount']) ? (bool) $settings['enable_estimated_amount']->value : false, // Default to false
            'enable_bank_pledge' => isset($settings['enable_bank_pledge']) ? (bool) $settings['enable_bank_pledge']->value : false, // Default to false
            'no_branch_mode' => isset($settings['no_branch_mode']) ? (bool) $settings['no_branch_mode']->value : false, // Default to false
            'enable_approvals' => isset($settings['enable_approvals']) ? (bool) $settings['enable_approvals']->value : false, // Default to false
        ]);
    }

    public function update(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'enable_customer_app' => 'sometimes|boolean',
            'enable_transactions' => 'sometimes|boolean',
            'enable_tasks' => 'sometimes|boolean',
            'enable_receipt_print' => 'sometimes|boolean',
            'enable_estimated_amount' => 'sometimes|boolean',
            'enable_bank_pledge' => 'sometimes|boolean',
            'no_branch_mode' => 'sometimes|boolean',
            'enable_approvals' => 'sometimes|boolean'
        ]);

        $branchId = $request->branch_id;

        if ($request->has('enable_customer_app')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_customer_app',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_customer_app ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_transactions')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_transactions',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_transactions ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_tasks')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_tasks',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_tasks ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_receipt_print')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_receipt_print',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_receipt_print ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_estimated_amount')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_estimated_amount',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_estimated_amount ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_bank_pledge')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_bank_pledge',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_bank_pledge ? '1' : '0'
                ]
            );
        }

        if ($request->has('no_branch_mode')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'no_branch_mode',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->no_branch_mode ? '1' : '0'
                ]
            );
        }

        if ($request->has('enable_approvals')) {
            \App\Models\Settings::updateOrCreate(
                [
                    'key' => 'enable_approvals',
                    'branch_id' => $branchId
                ],
                [
                    'value' => $request->enable_approvals ? '1' : '0'
                ]
            );
        }

        return response()->json(['status' => 'success', 'message' => 'Settings updated successfully']);
    }
    public function resolve(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $branchId = $user ? $user->branch_id : null;

        $keys = ['enable_customer_app', 'enable_transactions', 'enable_tasks', 'enable_receipt_print', 'enable_estimated_amount', 'enable_bank_pledge', 'no_branch_mode', 'enable_approvals'];

        $resolvedSettings = [];

        foreach ($keys as $key) {
            $setting = \App\Models\Settings::where('key', $key)
                ->where(function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId)
                        ->orWhereNull('branch_id');
                })
                ->orderByDesc('branch_id') // Branch ID (non-null) > Null
                ->first();

            // Defaults
            $defaultValue = match ($key) {
                'enable_customer_app' => false,
                'enable_transactions' => false,
                'enable_tasks' => false,
                'enable_receipt_print' => false,
                'enable_estimated_amount' => false,
                'enable_bank_pledge' => false,
                'no_branch_mode' => false,
                'enable_approvals' => false,
                default => null
            };

            $resolvedSettings[$key] = $setting ? (bool) $setting->value : $defaultValue;
        }

        return response()->json($resolvedSettings);
    }
}
