import React, { useState, useEffect } from "react";
import { X, PlusCircle, CreditCard, Loader2, AlertCircle } from "lucide-react";
import api from "../../api/apiClient";
import { useToast } from "../../context/Toast/ToastContext";

interface Props {
    loan: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ExtraLoanModal: React.FC<Props> = ({ loan, isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Fresh loan data state
    const [currentLoan, setCurrentLoan] = useState<any>(null);
    const [fetchingLoan, setFetchingLoan] = useState(false);

    // Form State
    const [extraAmount, setExtraAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [moneySources, setMoneySources] = useState<any[]>([]);

    // Calculate available limit
    const availableLimit = currentLoan
        ? (Number(currentLoan.estimated_amount || 0) - Number(currentLoan.amount || 0))
        : 0;

    // Fetch fresh loan data when modal opens
    useEffect(() => {
        if (isOpen && loan?.id) {
            setFetchingLoan(true);
            api.get(`/loans/${loan.id}`)
                .then(res => {
                    setCurrentLoan(res.data);
                })
                .catch(err => {
                    console.error("Failed to fetch fresh loan data", err);
                    setCurrentLoan(loan);
                })
                .finally(() => setFetchingLoan(false));
        } else if (!isOpen) {
            setCurrentLoan(null);
            setExtraAmount('');
            setNotes('');
        }
    }, [isOpen, loan?.id]);

    // Fetch Money Sources
    useEffect(() => {
        if (isOpen) {
            api.get('/money-sources').then(res => {
                const sources = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setMoneySources(sources);
                if (sources.length > 0 && !paymentMethod) {
                    setPaymentMethod(sources[0].name);
                }
            }).catch(err => console.error("Failed to load money sources", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeLoan = currentLoan || loan;
        if (!activeLoan) return;

        if (!extraAmount || parseFloat(extraAmount) <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }

        if (parseFloat(extraAmount) > availableLimit) {
            showToast(`Extra amount cannot exceed available limit of ₹${availableLimit.toLocaleString()}`, "error");
            return;
        }

        if (!paymentMethod) {
            showToast("Please select a payment method", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/loans/${activeLoan.id}/add-extra`, {
                extra_amount: parseFloat(extraAmount),
                payment_method: paymentMethod,
                notes: notes
            });

            showToast("Extra amount added successfully", "success");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to add extra amount", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#2C3035]/50">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-blue-500" />
                            Extra Loan
                        </h2>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                            Loan #{(currentLoan || loan)?.loan_no}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
                    {/* Loan Info */}
                    {fetchingLoan ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Current Amount</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">₹{Number((currentLoan || loan)?.amount || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Estimated</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">₹{Number((currentLoan || loan)?.estimated_amount || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Available Limit */}
                            <div className={`p-4 rounded-xl border ${availableLimit > 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {availableLimit > 0 ? (
                                            <PlusCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                        )}
                                        <span className={`text-xs font-bold uppercase tracking-wider ${availableLimit > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                            Available Limit
                                        </span>
                                    </div>
                                    <span className={`text-xl font-black ${availableLimit > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                        ₹{availableLimit.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {availableLimit <= 0 && (
                                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                                        No extra limit available for this loan. The current amount has reached or exceeded the estimated amount.
                                    </p>
                                </div>
                            )}

                            {/* Extra Amount Input */}
                            {availableLimit > 0 && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Extra Amount <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={extraAmount}
                                                onChange={(e) => setExtraAmount(e.target.value)}
                                                placeholder="0.00"
                                                max={availableLimit}
                                                className="w-full h-12 pl-8 pr-4 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-lg text-gray-900 dark:text-white transition-all"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {extraAmount && parseFloat(extraAmount) > availableLimit && (
                                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-bold">
                                                Amount exceeds available limit
                                            </p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Payment Method <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all appearance-none"
                                                required
                                                disabled={loading}
                                            >
                                                {moneySources.length === 0 && <option value="">Loading...</option>}
                                                {moneySources.map((source: any) => (
                                                    <option key={source.id} value={source.name}>
                                                        {source.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add remarks..."
                                            className="w-full h-20 p-3 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-sm text-gray-900 dark:text-white transition-all resize-none"
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#2C3035]/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || availableLimit <= 0 || !extraAmount || parseFloat(extraAmount) <= 0 || parseFloat(extraAmount) > availableLimit}
                        className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        Add Extra Amount
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtraLoanModal;
