import React, { useState, useEffect } from 'react';
import { X, Scale, Loader2 } from 'lucide-react';
import api from '../../api/apiClient';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const GoldLoanCalculator: React.FC<Props> = ({ isOpen, onClose }) => {
    const [loadingRate, setLoadingRate] = useState(false);
    const [metalRate, setMetalRate] = useState<number>(0);

    // Inputs
    const [weight, setWeight] = useState<string>('');
    const [loanPerGram, setLoanPerGram] = useState<string>('');

    // Results
    const [estimatedAmount, setEstimatedAmount] = useState<number>(0);

    // Fetch Metal Rate on Open
    useEffect(() => {
        if (isOpen) {
            setLoadingRate(true);
            api.get('/metal-rates').then(res => {
                // Assuming API returns an array or object. Let's try to find the latest rate.
                // If response is array of rate objects
                if (Array.isArray(res.data) && res.data.length > 0) {
                    // Look for active rate or latest
                    const rate = res.data[0]?.rate_per_gram || res.data[0]?.rate || 0;
                    setMetalRate(Number(rate));
                    // Auto-set loan per gram to something like 75% of rate (LTV) just as a hint? 
                    // Or just use the rate itself if that's what user expects?
                    // Let's assume Loan Per Gram is manually entered usually, or we default to 75% of rate
                    if (rate > 0) setLoanPerGram(Math.floor(Number(rate) * 0.75).toString());
                }
                // If direct object
                else if (res.data?.rate) {
                    setMetalRate(Number(res.data.rate));
                    setLoanPerGram(Math.floor(Number(res.data.rate) * 0.75).toString());
                }
            }).catch(console.error).finally(() => setLoadingRate(false));
        }
    }, [isOpen]);

    // Calculation
    useEffect(() => {
        const w = parseFloat(weight) || 0;
        const lpg = parseFloat(loanPerGram) || 0;

        // Simple logic: Weight * Loan Per Gram
        // In real scenarios, purity might affect it (e.g. net weight). 
        // For now, let's assume 'weight' is net weight eligible for loan.
        setEstimatedAmount(Math.floor(w * lpg));
    }, [weight, loanPerGram]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                            <Scale className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Gold Loan Estimate</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Calculate loan eligibility</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">

                    {/* Metal Rate Banner */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Current Rate (22K)</span>
                        {loadingRate ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                        ) : (
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{metalRate}/g</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Weight */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Weight (grams)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 text-lg font-bold text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>

                        {/* Loan Per Gram */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount / Gram</label>
                            <input
                                type="number"
                                value={loanPerGram}
                                onChange={(e) => setLoanPerGram(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold"
                                placeholder="0"
                            />
                            <p className="text-[10px] text-gray-400">Adjust based on LTV (e.g. 75% of market rate)</p>
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
                </div>
            </div>
        </div>
    );
};

export default GoldLoanCalculator;
