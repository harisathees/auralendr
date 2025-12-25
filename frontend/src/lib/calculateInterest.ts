export type CalculationMethod = 'method1' | 'method2' | 'method3' | 'method4';

export interface InterestResult {
    totalMonths: string;
    finalInterestRate: string;
    totalInterest: number;
    interestReduction: number;
    additionalReduction: number;
    totalAmount: number;
}

export function calculateInterest(
    method: CalculationMethod,
    fromDateStr: string,
    toDateStr: string,
    amount: number,
    interestRate: number,
    validityMonths: number,
    interestStatus: 'taken' | 'notTaken',
    additionalReduction: number = 0
): InterestResult {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    let totalInterest = 0;
    let finalRateDisplay = '';
    let totalMonthsLabel = '';

    if (toDate < fromDate) {
        return emptyResult('Invalid date range');
    }

    const baseRate = interestRate;
    const surchargeRate = baseRate + 0.5;

    function applyReductions(totalInterest: number): InterestResult {
        let interestReduction = 0;
        let totalPayable = amount + totalInterest;

        if (interestStatus === 'taken') {
            interestReduction = amount * (baseRate / 100);
            totalPayable -= interestReduction;
        }

        if (totalPayable < amount) {
            totalPayable = amount;
        }

        if (additionalReduction > 0) {
            totalPayable -= additionalReduction;
        }

        return {
            totalMonths: totalMonthsLabel,
            finalInterestRate: finalRateDisplay,
            totalInterest: round(totalInterest),
            interestReduction: round(interestReduction),
            additionalReduction: round(additionalReduction),
            totalAmount: round(totalPayable),
        };
    }

    function round(num: number) {
        return Math.round(num);
    }

    if (method === 'method1') {
        const FY = fromDate.getFullYear();
        const TY = toDate.getFullYear();
        const FM = fromDate.getMonth() + 1;
        const TM = toDate.getMonth() + 1;
        const FD = fromDate.getDate();
        const TD = toDate.getDate();

        let months = (TY - FY) * 12 + (TM - FM);
        if (TD > FD) months++;
        if (months < 0) return emptyResult('Negative duration');

        totalMonthsLabel = `${months} Months`;

        if (months <= validityMonths) {
            totalInterest = amount * (baseRate / 100) * months;
            finalRateDisplay = `${baseRate.toFixed(2)}% per month`;
        } else {
            totalInterest =
                amount * (baseRate / 100) * validityMonths +
                amount * (surchargeRate / 100) * (months - validityMonths);
            finalRateDisplay = `${baseRate.toFixed(2)}% for ${validityMonths} months, then ${surchargeRate.toFixed(2)}%`;
        }

        return applyReductions(totalInterest);
    }

    if (method === 'method2' || method === 'method3') {
        let totm = 0;
        let current = new Date(fromDate);
        while (current < toDate) {
            const nextMonth = new Date(current);
            nextMonth.setMonth(current.getMonth() + 1);

            const periodEnd = nextMonth > toDate ? toDate : nextMonth;
            const days = (periodEnd.getTime() - current.getTime()) / (1000 * 3600 * 24);

            let fraction = 1;
            if (method === 'method2') {
                if (days < 7) fraction = 0.5;
                else if (days < 15) fraction = 0.75;
            } else if (method === 'method3') {
                if (days < 10) fraction = 0.5;
            }

            totm += fraction;

            const rate = totm <= validityMonths ? baseRate : surchargeRate;
            totalInterest += amount * (rate / 100) * fraction;

            current = nextMonth;
        }

        totalMonthsLabel = `${totm.toFixed(2)} Months`;
        finalRateDisplay = totm <= validityMonths
            ? `${baseRate.toFixed(2)}% per month`
            : `${baseRate.toFixed(2)}% for first ${validityMonths} months, then ${surchargeRate.toFixed(2)}%`;

        return applyReductions(totalInterest);
    }

    if (method === 'method4') {
        const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
        let daysToUse = totalDays + 1;
        if (totalDays > 0 && totalDays < 10) daysToUse = 10;

        const annualBase = baseRate * 12;
        const annualSurcharge = annualBase + 6;
        const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
        let interestMonths = monthsDiff + (toDate.getDate() > fromDate.getDate() ? 1 : 0);
        if (interestMonths < 0) interestMonths = 0;

        if (interestMonths <= validityMonths) {
            totalInterest = amount * (annualBase / 100) * (daysToUse / 360);
            finalRateDisplay = `${annualBase.toFixed(2)}% per annum`;
        } else {
            const baseDays = validityMonths * 30;
            const extraDays = daysToUse - baseDays;
            totalInterest = amount * (annualBase / 100) * (baseDays / 360);
            if (extraDays > 0) {
                totalInterest += amount * (annualSurcharge / 100) * (extraDays / 360);
            }
            finalRateDisplay = `${annualBase.toFixed(2)}% for ${validityMonths} months, then ${annualSurcharge.toFixed(2)}%`;
        }

        totalMonthsLabel = `${daysToUse} Days (Original: ${totalDays} Days)`;
        return applyReductions(totalInterest);
    }

    return emptyResult('Unknown method');
}

function emptyResult(msg: string): InterestResult {
    return {
        totalMonths: msg,
        finalInterestRate: '--',
        totalInterest: 0,
        interestReduction: 0,
        additionalReduction: 0,
        totalAmount: 0,
    };
}
