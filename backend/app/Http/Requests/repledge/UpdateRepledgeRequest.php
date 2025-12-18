<?php

namespace App\Http\Requests\Repledge;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRepledgeRequest extends FormRequest
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
            'loan_no' => 'sometimes|required|string',
            're_no' => 'sometimes|required|string',
            'loan_id' => 'nullable|exists:loans,id',
            'repledge_source_id' => 'sometimes|required|exists:repledge_sources,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'processing_fee' => 'nullable|numeric|min:0',
            'net_weight' => 'sometimes|required|numeric|min:0',
            'gross_weight' => 'nullable|numeric|min:0',
            'stone_weight' => 'nullable|numeric|min:0',
            'interest_percent' => 'nullable|numeric|min:0',
            'validity_period' => 'nullable|integer|min:0',
            'after_interest_percent' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'status' => 'nullable|in:active,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ];
    }
}
