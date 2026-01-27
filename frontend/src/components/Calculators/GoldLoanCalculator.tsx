import React, { useState, useEffect } from 'react';
import { X, Loader2, Calculator } from 'lucide-react';
import api from '../../api/apiClient';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const GoldLoanCalculator: React.FC<Props> = ({ isOpen, onClose }) => {
    const [loadingData, setLoadingData] = useState(false);

    // Metadata
    const [metalRates, setMetalRates] = useState<{ name: string; metal_rate?: { rate: string } }[]>([]);
    const [interestRates, setInterestRates] = useState<{ id: number; rate: string; estimation_percentage?: string }[]>([]);

    // Inputs
    const [jewelType, setJewelType] = useState<'Gold' | 'Silver'>('Gold');
    const [weight, setWeight] = useState<string>('');
    const [selectedInterestRateId, setSelectedInterestRateId] = useState<string>('');

    // Results
    const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
    const [currentRatePerGram, setCurrentRatePerGram] = useState<number>(0);
    const [estimationPercent, setEstimationPercent] = useState<number>(0);

    // Fetch Data on Open
    useEffect(() => {
        if (isOpen) {
            setLoadingData(true);
            Promise.all([
                api.get('/metal-rates'),
                api.get('/interest-rates')
            ]).then(([metalRes, interestRes]) => {
                if (Array.isArray(metalRes.data)) setMetalRates(metalRes.data);
                if (Array.isArray(interestRes.data)) setInterestRates(interestRes.data);
            }).catch(console.error).finally(() => setLoadingData(false));
        }
    }, [isOpen]);

    // Calculate
    useEffect(() => {
        if (!metalRates.length || !interestRates.length) return;

        // 1. Get Rate Per Gram
        const rateObj = metalRates.find(r => r.name.toLowerCase().includes(jewelType.toLowerCase()));
        // Handle various API structures safely
        const rateVal = parseFloat(rateObj?.metal_rate?.rate || (rateObj as any)?.rate || "0");
        setCurrentRatePerGram(rateVal);

        // 2. Get Estimation Percentage
        const interestStr = selectedInterestRateId;
        // We store ID in select, so find object
        const interestObj = interestRates.find(r => String(r.id) === interestStr);
        const estPercent = parseFloat(interestObj?.estimation_percentage || "0");
        setEstimationPercent(estPercent);

        // 3. Calculate
        const w = parseFloat(weight) || 0;

        if (rateVal > 0 && estPercent > 0 && w > 0) {
            // Estimated Amount = Weight * Rate/gram * (Estimation% / 100)
            const estimated = w * rateVal * (estPercent / 100);
            setEstimatedAmount(Math.floor(estimated));
        } else {
            setEstimatedAmount(0);
        }

    }, [weight, jewelType, selectedInterestRateId, metalRates, interestRates]);

    // Auto-select first interest rate if none selected
    useEffect(() => {
        if (interestRates.length > 0 && !selectedInterestRateId) {
            setSelectedInterestRateId(String(interestRates[0].id));
        }
    }, [interestRates, selectedInterestRateId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Estimation Calculator</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Calculate loan eligibility</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">

                    {/* Banner Info */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Market Rate ({jewelType})</span>
                            {loadingData ? (
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            ) : (
                                <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{currentRatePerGram}/g</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between border-t border-amber-200 dark:border-amber-800/30 pt-1 mt-1">
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-500">Estimation %</span>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{estimationPercent}%</span>
                        </div>
                    </div>

                    <div className="space-y-4">

                        {/* Jewel Type Details */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Type Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Metal</label>
                                <select
                                    value={jewelType}
                                    onChange={(e) => setJewelType(e.target.value as 'Gold' | 'Silver')}
                                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 text-sm font-semibold text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="Gold">Gold</option>
                                    <option value="Silver">Silver</option>
                                </select>
                            </div>

                            {/* Interest Scheme Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Interest / Scheme</label>
                                <select
                                    value={selectedInterestRateId}
                                    onChange={(e) => setSelectedInterestRateId(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 text-sm font-semibold text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                >
                                    {interestRates.map(ir => (
                                        <option key={ir.id} value={ir.id}>{parseFloat(ir.rate)}%</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Net Weight (grams)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-lg font-bold text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-300"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>

                    </div>

                    {/* Results Area */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-2">
                        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl p-5 shadow-lg shadow-gray-200 dark:shadow-gray-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 dark:bg-black/5 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <span className="text-xs font-medium opacity-70 uppercase tracking-widest">Estimated Loan Amount</span>
                                <span className="text-3xl font-black tracking-tight">
                                    ₹{estimatedAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Calculation: Weight × Rate × (Estimation% / 100)
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GoldLoanCalculator;
