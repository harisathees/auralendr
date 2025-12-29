import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { calculateInterest, type CalculationMethod } from '../../lib/calculateInterest';
import { useLoanCalculation } from "../../hooks/useLoanCalculation";
import GoldCoinSpinner from '../../components/GoldCoinSpinner';

// --- Text/Label Component ---
const InfoRow = ({ label, value, valueClass = 'text-primary-text dark:text-gray-200' }: { label: string, value: React.ReactNode, valueClass?: string }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <span className="text-secondary-text dark:text-gray-400">{label}</span>
        <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
);

// --- Layout Components matching PledgeView ---
const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <h3 className="text-gray-800 dark:text-white text-xl font-bold">{title}</h3>
        </div>
        {children}
    </section>
);

// --- Loading & Success States ---
const LoadingState: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm">
        <GoldCoinSpinner text={text} svgClassName="w-20 h-20" />
    </div>
);

const SuccessState: React.FC = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pledge Closed!</h2>
            <p className="text-gray-500 dark:text-gray-400">Successfully closed the loan. Redirecting...</p>
        </div>
    </div>
);

const ErrorState: React.FC<{ error: string, onBack: () => void }> = ({ error, onBack }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">warning</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Go Back
            </button>
        </div>
    </div>
);


const ClosePledge: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const { loanData, metalRates, loading, error, saving, saveCalculationAndCloseLoan } = useLoanCalculation(loanId || null);

    const [selectedMethod, setSelectedMethod] = useState<CalculationMethod>('method1');
    const [toDate, setToDate] = useState('');
    const [reductionAmount, setReductionAmount] = useState<string>('');
    const [balanceAmount, setBalanceAmount] = useState<string>('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [currentMetalRate, setCurrentMetalRate] = useState<string | null>(null);

    // Payment Source State
    const [moneySources, setMoneySources] = useState<any[]>([]);
    const [paymentSourceId, setPaymentSourceId] = useState<string>('');
    const [amountPaid, setAmountPaid] = useState<string>('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setToDate(today);

        // Fetch Money Sources
        import('../../api/apiClient').then(module => {
            module.default.get('/money-sources').then(res => {
                if (Array.isArray(res.data)) {
                    setMoneySources(res.data);
                    // Auto-select first source if available
                    if (res.data.length > 0) {
                        setPaymentSourceId(String(res.data[0].id));
                    }
                }
            });
        });
    }, []);

    // Determine current metal rate
    useEffect(() => {
        if (!loanData || !metalRates.length) return;

        // Strategy from PledgeForm: Look at first jewel's type
        const firstJewelTypeName = loanData?.jewels?.[0]?.jewel_type || "";
        const isSilver = firstJewelTypeName.toLowerCase().includes("silver");

        const rateObj = metalRates.find((r: any) => r.name.toLowerCase().includes(isSilver ? "silver" : "gold"));
        if (rateObj?.metal_rate?.rate) {
            setCurrentMetalRate(rateObj.metal_rate.rate);
        }
    }, [loanData, metalRates]);

    // Calculate result at top level (safe from early returns)
    // using useMemo to ensure stable reference and derived from current state
    const redAmount = Number(reductionAmount) || 0;

    // Memoize the result based on loanData and inputs. 
    // Handle the null loanData case gracefully inside useMemo.
    const result = useMemo(() => {
        if (!loanData) return null;
        return calculateInterest(
            selectedMethod,
            loanData.date,
            toDate,
            loanData.amount,
            loanData.interest_rate,
            loanData.validity_months,
            loanData.interest_taken ? 'taken' : 'notTaken',
            redAmount
        );
    }, [loanData, selectedMethod, toDate, redAmount]);

    // Auto-calculate Amount Paid based on Balance Amount
    useEffect(() => {
        if (!result) return;
        const total = result.totalAmount;
        const bal = Number(balanceAmount) || 0;
        const payNow = Math.max(0, total - bal);
        setAmountPaid(String(payNow));
    }, [result?.totalAmount, balanceAmount]);

    const handleClosePledge = async () => {
        if (!loanData || !toDate || !paymentSourceId || !amountPaid || !result) return;
        const balAmount = Number(balanceAmount) || 0;
        const paidAmt = Number(amountPaid) || 0;

        const success = await saveCalculationAndCloseLoan(
            toDate,
            redAmount,
            selectedMethod,
            {
                ...result,
                balance_amount: balAmount,
                metal_rate: currentMetalRate ? Number(currentMetalRate) : null
            },
            Number(paymentSourceId),
            paidAmt
        );
        if (success) {
            setShowSuccessMessage(true);
            setTimeout(() => navigate('/pledges'), 2000);
        }
    };

    // Helper boolean to style differently based on Gold/Silver if needed
    const isSilverRatio = loanData?.jewels?.[0]?.jewel_type?.toLowerCase().includes("silver");

    const methodOptions = [
        { value: 'method1', label: 'Scheme 1 (Maximum Interest)' },
        { value: 'method2', label: 'Scheme 2 (Minimum Interest)' },
        { value: 'method3', label: 'Scheme 3 (Medium Interest)' },
        { value: 'method4', label: 'Scheme 4 (Day Basis)' },
    ];

    // EARLY RETURN CHECKS (Must be AFTER all Hooks)
    if (loading) return <LoadingState text="Fetching Loan Details..." />;
    if (showSuccessMessage) return <SuccessState />;
    if (error || !loanData || !result) return <ErrorState error={error || 'Loan data not found.'} onBack={() => navigate('/pledges')} />;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex-none">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Close Pledge</h1>
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                                    {loanData.loan_no}
                                </span>
                            </div>
                        </div>
                    </div>
                    {currentMetalRate && (
                        <div className="flex items-center gap-3 text-xs md:text-sm font-medium bg-gradient-to-r from-amber-50/50 to-slate-50/50 dark:from-amber-900/10 dark:to-slate-900/10 px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/30 shadow-sm cursor-default shrink-0">
                            <span className={`flex items-center gap-1.5 ${isSilverRatio ? 'text-slate-600 dark:text-slate-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 duration-1000 ${isSilverRatio ? 'bg-slate-400' : 'bg-amber-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSilverRatio ? 'bg-slate-500' : 'bg-amber-500'}`}></span>
                                </span>
                                <span className="hidden sm:inline">Rate:</span>
                                ₹{currentMetalRate}/g
                            </span>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto p-4 space-y-6 w-full pb-20">

                {/* Loan Summary */}
                <Section title="Loan Summary" icon="description">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <InfoRow label="Principal Amount" value={`₹${loanData.amount.toLocaleString('en-IN')}`} valueClass="text-primary font-bold text-lg" />
                        <InfoRow label="Start Date" value={new Date(loanData.date).toLocaleDateString('en-GB')} />
                        <InfoRow label="Interest Rate" value={`${loanData.interest_rate}% / month`} />
                        <InfoRow label="Validity" value={`${loanData.validity_months} Months`} />
                        <InfoRow label="Interest Paid" value={loanData.interest_taken ? 'Yes' : 'No'} />
                        <InfoRow
                            label="Current Status"
                            value={loanData.status.toUpperCase()}
                            valueClass={loanData.status === 'closed' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs' : 'text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs'}
                        />
                    </div>
                </Section>

                {/* Calculation Parameters */}
                <Section title="Calculation Parameters" icon="tune">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px] text-gray-400">calendar_today</span>
                                    Closing Date
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px] text-gray-400">remove_circle</span>
                                    Reduction (₹)
                                </label>
                                <input
                                    type="number"
                                    value={reductionAmount}
                                    onChange={(e) => setReductionAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px] text-gray-400">calculate</span>
                                Calculation Method
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value as CalculationMethod)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    {methodOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Results Card */}
                <Section title="Final Calculation" icon="receipt_long">
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                            <InfoRow label="Duration" value={result.totalMonths} />
                            <InfoRow label="Applied Interest Rate" value={result.finalInterestRate} />
                        </div>

                        <div className="space-y-2 pt-2">
                            <InfoRow label="Calculated Interest" value={`₹${result.totalInterest.toLocaleString('en-IN')}`} />

                            {result.interestReduction > 0 && (
                                <InfoRow
                                    label="Interest Taken"
                                    value={`- ₹${result.interestReduction.toLocaleString('en-IN')}`}
                                    valueClass="text-red-500 font-medium"
                                />
                            )}
                            {result.additionalReduction > 0 && (
                                <InfoRow
                                    label="Additional Reduction"
                                    value={`- ₹${result.additionalReduction.toLocaleString('en-IN')}`}
                                    valueClass="text-red-500 font-medium"
                                />
                            )}
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4"></div>

                        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl">
                            <span className="text-green-800 dark:text-green-300 font-medium">Total Payable Amount</span>
                            <span className="text-2xl font-bold text-green-700 dark:text-green-400">₹{result.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </Section>

                {/* Balance Payment Section (Yellow Theme) */}
                <section className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 shadow-sm border border-amber-200 dark:border-amber-700/30 transition-colors">
                    <div className="flex items-center gap-3 mb-5 border-b border-amber-200 dark:border-amber-700/30 pb-3">
                        <span className="material-symbols-outlined text-amber-700 dark:text-amber-500">account_balance_wallet</span>
                        <h3 className="text-amber-800 dark:text-amber-400 text-xl font-bold">Balance Payment</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                Pending / Balance Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                placeholder="Enter remaining amount if any"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-gray-900 dark:text-white font-bold placeholder:font-normal"
                            />
                            <p className="text-xs text-amber-700 dark:text-amber-500/80">
                                * This amount will be recorded as pending due.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                Deposit Payment To <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={paymentSourceId}
                                    onChange={(e) => setPaymentSourceId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Source</option>
                                    {moneySources.map(source => (
                                        <option key={source.id} value={source.id}>
                                            {source.name} (₹{source.balance})
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                Amount Paid Now (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="Enter amount being paid now"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-gray-900 dark:text-white font-bold placeholder:font-normal"
                            />
                        </div>
                    </div>
                </section>

                {/* Action Button */}
                <div className="pt-4 pb-8">
                    <button
                        onClick={handleClosePledge}
                        disabled={saving || loanData.status === 'closed' || !toDate || !paymentSourceId || !amountPaid}
                        className="group w-full h-14 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <GoldCoinSpinner svgClassName="w-6 h-6" />
                                <span>Processing...</span>
                            </>
                        ) : loanData.status === 'closed' ? (
                            <>
                                <span className="material-symbols-outlined">lock</span>
                                <span>Loan Already Closed</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">payments</span>
                                <span>Confirm & Close Pledge</span>
                            </>
                        )}
                    </button>
                </div>

            </main>
        </div>
    );
};

export default ClosePledge;
