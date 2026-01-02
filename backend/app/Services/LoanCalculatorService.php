<?php

namespace App\Services;

use App\Models\Admin\LoanConfiguration\LoanScheme;
use Carbon\Carbon;

class LoanCalculatorService
{
    /**
     * Calculate interest based on a scheme.
     *
     * @param LoanScheme|int $scheme
     * @param float $amount
     * @param string|Carbon $startDate
     * @param string|Carbon $endDate
     * @param float|null $overrideRate (Optional override of base rate)
     * @param int|null $validityMonths (Optional override of validity)
     * @param float $additionalReduction
     * @return array
     */
    public function calculate($scheme, float $amount, $startDate, $endDate, $overrideRate = null, $validityMonths = null, float $additionalReduction = 0)
    {
        if (is_numeric($scheme)) {
            $scheme = LoanScheme::findOrFail($scheme);
        }

        $startDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        if ($endDate->lessThan($startDate)) {
            throw new \Exception("End date cannot be before start date.");
        }

        $rate = $overrideRate ?? $scheme->interest_rate;
        $config = $scheme->scheme_config ?? [];
        $validity = $validityMonths ?? ($config['validity_months'] ?? 12);

        $result = [
            'totalMonths' => '',
            'finalInterestRate' => '',
            'totalInterest' => 0,
            'amount' => $amount,
            // 'reductions' => ...
        ];

        switch ($scheme->calculation_type) {
            case 'tiered': // Scheme 1 logic
                $this->calculateTiered($result, $amount, $rate, $startDate, $endDate, $validity, $config);
                break;
            case 'day_basis_tiered': // Scheme 2 & 3 logic
                $this->calculateDayBasisTiered($result, $amount, $rate, $startDate, $endDate, $validity, $config, $scheme->slug);
                break;
            case 'day_basis_compound': // Scheme 4 logic
                $this->calculateDayBasisCompound($result, $amount, $rate, $startDate, $endDate, $validity, $config);
                break;
            default: // Simple Interest Fallback
                $this->calculateSimple($result, $amount, $rate, $startDate, $endDate);
                break;
        }

        // Apply reductions logic (moved from frontend) usually happens at controller or service end
        // For now, return the raw interest components.

        return $result;
    }

    private function calculateTiered(&$result, $amount, $baseRate, $fromDate, $toDate, $validityMonths, $config)
    {
        $surchargeRate = $config['surcharge_rate'] ?? ($baseRate + 0.5);

        $diffYears = $toDate->year - $fromDate->year;
        $diffMonths = $toDate->month - $fromDate->month;
        $months = $diffYears * 12 + $diffMonths;

        // Exact day logic matching frontend (if TD > FD, +1 month)
        if ($toDate->day > $fromDate->day) {
            $months++;
        }

        // Standardize logic: even if same day next month, it's 1 month.
        // Frontend logic: (TD > FD) checks if day part has passed.

        if ($months < 0)
            $months = 0;

        $result['totalMonths'] = "{$months} Months";

        if ($months <= $validityMonths) {
            $totalInterest = $amount * ($baseRate / 100) * $months;
            $result['finalInterestRate'] = number_format($baseRate, 2) . "% per month";
        } else {
            $excessMonths = $months - $validityMonths;
            $totalInterest = ($amount * ($baseRate / 100) * $validityMonths) +
                ($amount * ($surchargeRate / 100) * $excessMonths);
            $result['finalInterestRate'] = number_format($baseRate, 2) . "% for {$validityMonths}m, then " . number_format($surchargeRate, 2) . "%";
        }

        $result['totalInterest'] = round($totalInterest);
    }

    private function calculateDayBasisTiered(&$result, $amount, $baseRate, $fromDate, $toDate, $validityMonths, $config, $slug)
    {
        $surchargeRate = $config['surcharge_rate'] ?? ($baseRate + 0.5);
        $thresholds = $config['thresholds'] ?? [];

        $totm = 0;
        $totalInterest = 0;
        $current = $fromDate->copy();

        // Iterate month by month
        while ($current->lessThan($toDate)) {
            $nextMonth = $current->copy()->addMonth();

            // Check boundaries
            $periodEnd = $nextMonth->greaterThan($toDate) ? $toDate : $nextMonth;

            // Calculate days in this partial period
            // Frontend using (periodEnd - current) in milliseconds / day
            // Carbon diffInDays is integer, use floatDiffInDays for precision if needed, but standard logic usually uses full days.
            // Frontend: (periodEnd.getTime() - current.getTime()) / (1000 * 3600 * 24) -> Float days

            // We need precise float days for <7 / <15 logic? 
            // Actually frontend logic: if days < 7 fraction = 0.5
            // $days can be fractional? "days" is difference in timestamps.

            $days = $current->floatDiffInDays($periodEnd);

            $fraction = 1;

            // Apply thresholds logic per month chunk
            foreach ($thresholds as $threshold) {
                if ($days < $threshold['days']) {
                    $fraction = $threshold['fraction'];
                    break; // Take the first matching (smallest) threshold
                }
            }

            // Special case logic from frontend if needed (Scheme 2 vs 3 is just config)
            // Scheme 2: <7 -> 0.5, <15 -> 0.75
            // Scheme 3: <10 -> 0.5
            // Config handles this via thresholds array.

            $totm += $fraction;

            $rate = ($totm <= $validityMonths) ? $baseRate : $surchargeRate;
            $totalInterest += $amount * ($rate / 100) * $fraction;

            $current = $nextMonth; // Move to next month start
        }

        $result['totalMonths'] = number_format($totm, 2) . " Months";
        $result['finalInterestRate'] = ($totm <= $validityMonths)
            ? number_format($baseRate, 2) . "% per month"
            : number_format($baseRate, 2) . "% till {$validityMonths}m, then " . number_format($surchargeRate, 2) . "%";

        $result['totalInterest'] = round($totalInterest);
    }

    private function calculateDayBasisCompound(&$result, $amount, $baseRate, $fromDate, $toDate, $validityMonths, $config)
    {
        // Scheme 4 Logic
        // baseRate is ANNUAl here (e.g. 24%)
        // surchargeAnnual = baseRate + 6% (default)

        $annualBase = $baseRate; // 24
        $annualSurcharge = $config['surcharge_rate'] ?? ($annualBase + 6);
        $minDays = $config['min_days'] ?? 10;

        $totalDays = $fromDate->diffInDays($toDate); // Integer days
        // Frontend uses ceil, Carbon is usually accurate. using diffInDays -> distinct days.
        // Frontend: Math.ceil((toDate - fromDate) / day)

        // $daysToUse logic
        $daysToUse = $totalDays + 1; // Inclusive? logic from frontend: totalDays + 1
        if ($totalDays > 0 && $totalDays < $minDays) {
            $daysToUse = $minDays;
        }

        // Interest Months calculation (Logic ported from frontend)
        $diffYears = $toDate->year - $fromDate->year;
        $diffMonths = $toDate->month - $fromDate->month;
        $rawMonths = $diffYears * 12 + $diffMonths;
        $afterDay = $toDate->day > $fromDate->day ? 1 : 0;
        $interestMonths = $rawMonths + $afterDay;
        if ($interestMonths < 0)
            $interestMonths = 0;

        if ($interestMonths <= $validityMonths) {
            // Formula: Amount * (AnnualRate/100) * (Days/360)
            $totalInterest = $amount * ($annualBase / 100) * ($daysToUse / 360);
            $result['finalInterestRate'] = number_format($annualBase, 2) . "% PA";
        } else {
            // Split days
            $baseDays = $validityMonths * 30; // 360 day year assumption
            $extraDays = $daysToUse - $baseDays;

            $firstPart = $amount * ($annualBase / 100) * ($baseDays / 360);
            $secondPart = ($extraDays > 0)
                ? $amount * ($annualSurcharge / 100) * ($extraDays / 360)
                : 0;

            $totalInterest = $firstPart + $secondPart;
            $result['finalInterestRate'] = number_format($annualBase, 2) . "% PA till {$validityMonths}m, then " . number_format($annualSurcharge, 2) . "%";
        }

        $result['totalMonths'] = "{$daysToUse} Days (Actual: {$totalDays})";
        $result['totalInterest'] = round($totalInterest);
    }

    private function calculateSimple(&$result, $amount, $rate, $fromDate, $toDate)
    {
        // Fallback
        $diffYears = $fromDate->diffInYears($toDate); // float?
        // Simple Interest: P * R * T (Years)
        $days = $fromDate->diffInDays($toDate);
        $years = $days / 365;

        $totalInterest = $amount * ($rate / 100) * $years; // Rate treated as Annual

        $result['totalMonths'] = number_format($days, 0) . " Days";
        $result['finalInterestRate'] = $rate . "% PA";
        $result['totalInterest'] = round($totalInterest);
    }
}
