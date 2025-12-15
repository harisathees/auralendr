<?php

namespace App\Http\Requests\pledge;

use Illuminate\Foundation\Http\FormRequest;

class StorePledgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Permission is already checked by middleware, so just return true
        // The middleware 'permission:pledge.create' will handle authorization
        return true;
    }

    public function messages(): array
    {
        return [
            'customer.required' => 'Customer information is required',
            'customer.name.required' => 'Customer name is required',
            'loan.required' => 'Loan information is required',
            'loan.amount.required' => 'Loan amount is required',
            'loan.amount.numeric' => 'Loan amount must be a number',
        ];
    }

    protected function prepareForValidation()
    {
        $loan = $this->input('loan');
        if (isset($loan['interest_percentage']) && is_string($loan['interest_percentage'])) {
            $loan['interest_percentage'] = floatval(str_replace('%', '', $loan['interest_percentage']));
            $this->merge(['loan' => $loan]);
        }
    }

    public function rules(): array
    {
        return [
            // Customer
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.mobile_no' => 'nullable|string|max:20',
            'customer.whatsapp_no' => 'nullable|string|max:20',
            'customer.address' => 'nullable|string|max:1000',
            'customer.sub_address' => 'nullable|string|max:255',
            'customer.id_proof_type' => 'nullable|string|max:100',
            'customer.id_proof_number' => 'nullable|string|max:255',

            // Loan
            'loan' => 'required|array',
            'loan.loan_no' => 'nullable|string|max:255|unique:loans,loan_no',
            'loan.date' => 'nullable|date',
            'loan.amount' => 'required|numeric|min:0',
            'loan.interest_percentage' => 'nullable|numeric|min:0',
            'loan.validity_months' => 'nullable|integer|min:0',
            'loan.due_date' => 'nullable|date',
            'loan.payment_method' => 'nullable|string|max:255',
            'loan.processing_fee' => 'nullable|numeric|min:0',
            'loan.estimated_amount' => 'nullable|numeric|min:0',
            'loan.include_processing_fee' => 'boolean',
            'loan.interest_taken' => 'boolean',
            'loan.amount_to_be_given' => 'nullable|numeric|min:0',
            
            // Pledge (optional fields)
            'pledge' => 'nullable|array',
            'pledge.status' => 'nullable|in:active,released,cancelled',
            'pledge.reference_no' => 'nullable|string|max:255|unique:pledges,reference_no',

            // Jewels
            'jewels' => 'nullable|array',
            'jewels.*.jewel_type' => 'required_with:jewels|string|max:255',
            'jewels.*.quality' => 'nullable|string|max:255',
            'jewels.*.description' => 'nullable|string',
            'jewels.*.pieces' => 'nullable|integer|min:1',
            'jewels.*.weight' => 'nullable|numeric|min:0',
            'jewels.*.stone_weight' => 'nullable|numeric|min:0',
            'jewels.*.net_weight' => 'nullable|numeric|min:0',
            'jewels.*.faults' => 'nullable|string',

            // Files
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|max:51200|mimes:jpg,jpeg,png,pdf,mp3,wav,mp4,webm,ogg,m4a',
            'file_categories' => 'nullable|array',
            'file_categories.*' => 'nullable|string|max:100',
        ];
    }
}
