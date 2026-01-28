import React, { useMemo } from 'react';
import { differenceInDays, parseISO, addMonths, isAfter } from 'date-fns';

interface Props {
    loan: any;
    jewels: any[];
}

const PledgeQuickStats: React.FC<Props> = ({ loan, jewels }) => {
    // --- 1. Loan Health (Time) ---
    const timeStats = useMemo(() => {
        if (!loan?.date || !loan?.validity_months) return null;

        const startDate = parseISO(loan.date);
        const dueDate = addMonths(startDate, loan.validity_months);
        const today = new Date();

        const totalDays = differenceInDays(dueDate, startDate);
        const elapsedDays = differenceInDays(today, startDate);
        const remainingDays = differenceInDays(dueDate, today);

        // Cap progress at 100%
        const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

        const isOverdue = isAfter(today, dueDate);

        return {
            progress,
            remainingDays,
            elapsedDays,
            isOverdue,
            totalDays
        };
    }, [loan]);

    // --- 2. Financial Snapshot ---
    const financialStats = useMemo(() => {
        const principal = Number(loan.amount || 0);
        const rate = Number(loan.interest_percentage || 0);

        // Estimate Interest
        const monthsElapsed = (timeStats?.elapsedDays || 0) / 30;
        const estimatedInterest = (principal * rate * monthsElapsed) / 100;

        const totalLiability = principal + estimatedInterest;

        return {
            principal,
            estimatedInterest,
            totalLiability
        };
    }, [loan, timeStats]);

    // --- 3. Payment Activity ---
    const paymentStats = useMemo(() => {
        const payments = loan.payments || [];
        const extras = loan.extras || [];

        const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.total_paid_amount || 0), 0);
        const totalExtraTaken = extras.reduce((sum: number, e: any) => sum + Number(e.extra_amount || 0), 0);

        return {
            paymentCount: payments.length,
            totalPaid,
            extraCount: extras.length,
            totalExtraTaken
        };
    }, [loan]);

    // --- 4. Asset Summary ---
    const assetStats = useMemo(() => {
        if (!jewels?.length) return { weight: 0, pieces: 0 };
        return {
            weight: jewels.reduce((sum, j) => sum + Number(j.net_weight || 0), 0),
            pieces: jewels.reduce((sum, j) => sum + Number(j.pieces || 0), 0)
        };
    }, [jewels]);

    if (!timeStats) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-2 lg:gap-0 lg:divide-x divide-gray-100 dark:divide-gray-800">

                {/* 1. Time Health - Precise */}
                <div className="flex flex-col justify-center lg:px-6 first:pl-0 border-r border-gray-100 dark:border-gray-800 lg:border-r-0 lg:border-none pr-3 lg:pr-6">
                    <div className="flex items-center gap-1.5 mb-2">
                        {/* <div className={`p-1 rounded-md ${timeStats.isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'} dark:bg-gray-800`}>
                            {timeStats.isOverdue ? <AlertCircle size={14} /> : <CalendarClock size={14} />}
                        </div> */}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Time</span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-lg font-black ${timeStats.isOverdue ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>
                                {Math.abs(timeStats.remainingDays)}d
                            </span>
                            <span className="text-[10px] font-bold text-gray-500">{timeStats.isOverdue ? 'Late' : 'Left'}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${timeStats.isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`}
                                style={{ width: `${timeStats.progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Liability - Simple */}
                <div className="flex flex-col justify-center pl-3 lg:px-6 lg:border-none">
                    <div className="flex items-center gap-1.5 mb-2">
                        {/* <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-gray-800">
                            <Wallet size={14} />
                        </div> */}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Liability</span>
                    </div>
                    <div>
                        <span className="text-lg font-black text-gray-900 dark:text-white block">
                            ₹{Math.round(financialStats.totalLiability).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-500 font-medium">₹{Math.round(financialStats.estimatedInterest).toLocaleString()} Int.</span>
                        </div>
                    </div>
                </div>

                {/* 3. Activity - Compact Stack */}
                <div className="flex flex-col justify-center lg:px-6 border-r border-gray-100 dark:border-gray-800 lg:border-r-0 lg:border-none pr-3 lg:pr-6 pt-2 lg:pt-0">
                    <div className="flex items-center gap-1.5 mb-2">
                        {/* <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-gray-800">
                            <TrendingUp size={14} />
                        </div> */}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Activity</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-gray-500">Paid</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">₹{paymentStats.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-gray-500">Extra</span>
                            <span className="text-xs font-bold text-amber-600">₹{paymentStats.totalExtraTaken.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Assets - Minimal */}
                <div className="flex flex-col justify-center pl-3 lg:px-6 pt-2 lg:pt-0">
                    <div className="flex items-center gap-1.5 mb-2">
                        {/* <div className="p-1 rounded-md bg-amber-50 text-amber-600 dark:bg-gray-800">
                            <Scale size={14} />
                        </div> */}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Assets</span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-gray-900 dark:text-white">{assetStats.weight}g</span>
                            <span className="text-[10px] text-gray-500 font-medium">Net</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-gray-500">{assetStats.pieces} Pcs</span>
                            {loan.metal_rate && <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded">₹{loan.metal_rate}/g</span>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PledgeQuickStats;
