<?php

namespace App\Http\Requests\Repledge;

use Illuminate\Foundation\Http\FormRequest;

class StoreRepledgeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'repledge_source_id' => 'required|exists:repledge_sources,id',
            'status' => 'nullable|in:active,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'due_date' => 'nullable|date',

            // Validate items array
            'items' => 'required|array|min:1',
            'items.*.loan_no' => 'required|string',
            'items.*.re_no' => 'required|string',
            'items.*.loan_id' => 'nullable|exists:loans,id',
            'items.*.amount' => 'required|numeric|min:0',
            'items.*.processing_fee' => 'nullable|numeric|min:0',
            'items.*.net_weight' => 'required|numeric|min:0',
            'items.*.gross_weight' => 'nullable|numeric|min:0',
            'items.*.stone_weight' => 'nullable|numeric|min:0',
            'items.*.interest_percent' => 'nullable|numeric|min:0',
            'items.*.validity_period' => 'nullable|integer|min:0',
            'items.*.after_interest_percent' => 'nullable|numeric|min:0',
            'items.*.payment_method' => 'nullable|string',
        ];
    }
}
