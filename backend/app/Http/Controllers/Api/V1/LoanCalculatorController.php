<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\LoanCalculatorService;
use Illuminate\Http\Request;
use App\Models\Pledge\Loan;
use App\Models\Admin\LoanConfiguration\LoanScheme;

class LoanCalculatorController extends Controller
{
    protected $calculator;

    public function __construct(LoanCalculatorService $calculator)
    {
        $this->calculator = $calculator;
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'scheme_slug' => 'required_without:scheme_id|string',
            'scheme_id' => 'required_without:scheme_slug|exists:loan_schemes,id',
            'reduction_amount' => 'nullable|numeric',
            'interest_status' => 'nullable|string|in:taken,notTaken', // For frontend compat
            'loan_id' => 'nullable|exists:loans,id', // To fetch context if needed
        ]);

        $scheme = $request->input('scheme_id')
            ? LoanScheme::findOrFail($request->input('scheme_id'))
            : LoanScheme::where('slug', $request->input('scheme_slug'))->firstOrFail();

        // Optional: Fetch override settings from Loan if ID provided?
        // Currently existing calculations rely on Loan's stored interest rate if different from scheme?
        // Frontend logic passed 'loanData.interest_rate'. 
        // The service takes optional overrideRate.
        // We should allow passing 'interest_rate' in request to override scheme default (legacy support).

        $overrideRate = $request->input('interest_rate');
        $validityMonths = $request->input('validity_months');

        try {
            $result = $this->calculator->calculate(
                $scheme,
                (float) $validated['amount'],
                $validated['start_date'],
                $validated['end_date'],
                $overrideRate ? (float) $overrideRate : null,
                $validityMonths ? (int) $validityMonths : null,
                (float) ($validated['reduction_amount'] ?? 0)
            );

            // Apply old "interest taken" reduction logic here if needed, or in Service.
            // Service returns raw interest. We can format it here.

            $totalAmount = $result['amount'] + $result['totalInterest'];
            $interestReduction = 0;

            if ($request->input('interest_status') === 'taken') {
                // Logic: interest_reduction = amount * (rate / 100)
                // Need to know "base rate" used for this reduction. usually scheme base rate.
                // Assuming it's simple 1 month interest? or flat?
                // Frontend: interestReduction = amount * (baseRate / 100);

                $rateUsed = $overrideRate ?? $scheme->interest_rate;
                $interestReduction = (float) $validated['amount'] * ($rateUsed / 100);
                $totalAmount -= $interestReduction;
            }

            // Apply Additional Reduction (from input)
            $additionalReduction = (float) ($validated['reduction_amount'] ?? 0);
            if ($additionalReduction > 0) {
                $totalAmount -= $additionalReduction;
            }

            // Ensure not less than principal? Frontend: "if (totalPayable < amount) totalPayable = amount;"
            if ($totalAmount < $validated['amount']) {
                $totalAmount = (float) $validated['amount'];
            }

            return response()->json([
                'totalMonths' => $result['totalMonths'],
                'finalInterestRate' => $result['finalInterestRate'],
                'totalInterest' => $result['totalInterest'],
                'interestReduction' => round($interestReduction),
                'additionalReduction' => round($additionalReduction),
                'totalAmount' => round($totalAmount),
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
