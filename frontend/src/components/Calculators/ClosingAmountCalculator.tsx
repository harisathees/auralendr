import React, { useState, useEffect } from 'react';
import { X, Calculator, Loader2 } from 'lucide-react';
import api from '../../api/apiClient';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ClosingAmountCalculator: React.FC<Props> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);

    // Data
    const [loanSchemes, setLoanSchemes] = useState<any[]>([]);

    // Inputs
    const [amount, setAmount] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState<string>('');
    const [selectedScheme, setSelectedScheme] = useState<string>('');

    // Results
    const [result, setResult] = useState<any>(null);

    // Fetch Metadata
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get('/loan-schemes?status=active').then(res => {
                if (Array.isArray(res.data)) {
                    setLoanSchemes(res.data);
                    // Default scheme auto-select
                    if (res.data.length > 0) setSelectedScheme(res.data[0].slug);
                }
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [isOpen]);

    // Calculation Logic
    useEffect(() => {
        if (!amount || !startDate || !endDate || !interestRate || !selectedScheme) {
            setResult(null);
            return;
        }

        const calculate = async () => {
            setCalculating(true);
            try {
                const res = await api.post('/loan-calculator/calculate', {
                    amount: parseFloat(amount),
                    start_date: startDate,
                    end_date: endDate,
                    scheme_slug: selectedScheme,
                    interest_rate: parseFloat(interestRate),
                    validity_months: 12, // Default or generic
                    reduction_amount: 0,
                    interest_status: 'notTaken'
                });
                setResult(res.data);
            } catch (e) {
                console.error("Calculation Error", e);
            } finally {
                setCalculating(false);
            }
        };

        const timer = setTimeout(calculate, 600);
        return () => clearTimeout(timer);

    }, [amount, startDate, endDate, interestRate, selectedScheme]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Calculator</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Calculate interest & payable amount</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        {/* Principal */}
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Principal Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold"
                                placeholder="1.5"
                            />
                        </div>

                        {/* Dates */}
                        <div className="space-y-1.5 col-span-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="space-y-1.5 col-span-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        {/* Scheme */}
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Calculation Scheme</label>
                            <select
                                value={selectedScheme}
                                onChange={(e) => setSelectedScheme(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                            >
                                {loanSchemes.map(s => (
                                    <option key={s.id} value={s.slug}>{s.name}</option>
                                ))}
                                {loading && <option>Loading...</option>}
                            </select>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-2">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3 relative overflow-hidden">
                            {calculating && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                                <span className="font-medium text-gray-900 dark:text-white">{result?.totalMonths || '---'}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Total Interest</span>
                                <span className={`font-bold ${result ? 'text-orange-600 dark:text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                    {result ? `₹${result.totalInterest.toLocaleString('en-IN')}` : '---'}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2"></div>

                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Total Payable</span>
                                <span className="text-2xl font-black text-green-600 dark:text-green-400">
                                    {result ? `₹${result.totalAmount.toLocaleString('en-IN')}` : '---'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClosingAmountCalculator;
