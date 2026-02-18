<?php

namespace App\Services;

use App\Models\Pledge\Loan;
use App\Models\Admin\LoanConfiguration\LoanScheme;
use App\Services\LoanCalculatorService;
use Carbon\Carbon;

class InterestCalculatorService
{
    protected $calculator;

    public function __construct(LoanCalculatorService $calculator)
    {
        $this->calculator = $calculator;
    }

    /**
     * Calculate accrued interest using the Loan's specific calculation method/scheme.
     */
    public function calculateAccruedInterest(Loan $loan)
    {
        $now = Carbon::now();

        // Determine start date: Last Payment Date OR Loan Date
        $lastPayment = $loan->payments->sortByDesc('payment_date')->first();
        $startDate = $lastPayment ? Carbon::parse($lastPayment->payment_date) : Carbon::parse($loan->date);

        if ($now->lessThan($startDate)) {
            return [
                'interest' => 0,
                'duration' => '0 Days',
                'start_date' => $startDate->toDateString(),
                'end_date' => $now->toDateString(),
                'balance' => $loan->balance_amount ?? $loan->amount,
                'rate' => $loan->interest_percentage . '%',
            ];
        }

        // Get Scheme
        $schemeSlug = $loan->calculation_method ?? 'scheme-1'; // Default Fallback
        $scheme = LoanScheme::where('slug', $schemeSlug)->first();

        // If scheme not found, try to find a default one, or fallback to simple logic?
        // Ideally we should have the scheme. If not, we might need a fallback 'manual' calculation matching scheme-1.

        $balance = $loan->balance_amount ?? $loan->amount;

        if ($scheme) {
            try {
                $result = $this->calculator->calculate(
                    $scheme,
                    (float) $balance,
                    $startDate,
                    $now,
                    (float) $loan->interest_percentage, // Override with loan's stored rate
                    (int) $loan->validity_months // Override validity
                );

                return [
                    'interest' => $result['totalInterest'],
                    'duration' => $result['totalMonths'], // String: "X Months" or "Y Days"
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $now->toDateString(),
                    'balance' => $balance,
                    'rate' => $result['finalInterestRate'],
                ];
            } catch (\Exception $e) {
                \Log::error("Interest Calculation Failed for Loan {$loan->loan_no}: " . $e->getMessage());
            }
        }

        // FALLBACK: Simple Jumping Month (if scheme missing)
        // ... (Keep previous logic as fallback?) 
        // Or just return 0 with error? Better to fallback to old logic for safety.

        // Jumping Month Logic (Fallback)
        $diffYears = $now->year - $startDate->year;
        $diffMonths = $now->month - $startDate->month;
        $months = $diffYears * 12 + $diffMonths;
        if ($now->day > $startDate->day)
            $months++;
        if ($months < 0)
            $months = 0;

        $interest = $balance * ($loan->interest_percentage / 100) * $months;

        return [
            'interest' => round($interest),
            'duration' => "{$months} Months (Fallback)",
            'start_date' => $startDate->toDateString(),
            'end_date' => $now->toDateString(),
            'balance' => $balance,
            'rate' => $loan->interest_percentage . '%',
        ];
    }
}
