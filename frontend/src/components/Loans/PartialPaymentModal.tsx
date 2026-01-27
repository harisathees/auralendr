import React, { useState, useEffect } from "react";
import { X, Banknote, Calendar, CreditCard, Loader2 } from "lucide-react";
import api from "../../api/apiClient";
import { useToast } from "../../context/Toast/ToastContext";

interface Props {
    loan: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PartialPaymentModal: React.FC<Props> = ({ loan, isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState<string>('');
    const [interestComponent, setInterestComponent] = useState<string>('');
    const [principalComponent, setPrincipalComponent] = useState<string>('0');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [moneySources, setMoneySources] = useState<any[]>([]);

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

    // Auto-calculate Principal Component
    useEffect(() => {
        const total = parseFloat(amount) || 0;
        const interest = parseFloat(interestComponent) || 0;

        // Principal = Total - Interest
        // Ensure result is not negative
        const principal = Math.max(0, total - interest);
        setPrincipalComponent(principal.toFixed(2));
    }, [amount, interestComponent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan) return;

        if (!amount || parseFloat(amount) <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }

        if (!paymentMethod) {
            showToast("Please select a valid payment method", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post('/loan-payments', {
                loan_id: loan.id,
                amount: parseFloat(amount),
                interest_component: parseFloat(interestComponent) || 0,
                principal_component: parseFloat(principalComponent) || 0,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                notes: notes
            });

            showToast("Payment recorded successfully", "success");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to record payment", "error");
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
                            <Banknote className="w-5 h-5 text-emerald-500" />
                            Partial Payment
                        </h2>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                            Loan #{loan?.loan_no} • Bal: ₹{Number(loan?.balance_amount || loan?.amount).toLocaleString()}
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

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Total Paying Amount <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full h-12 pl-8 pr-4 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-lg text-gray-900 dark:text-white transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Split Section */}
                    <div className="bg-gray-50 dark:bg-[#2C3035]/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                            <SlidersHorizontalIcon className="w-3 h-3" />
                            Payment Split
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Interest Component */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                    Interest Part
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                    <input
                                        type="number"
                                        value={interestComponent}
                                        onChange={(e) => setInterestComponent(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-10 pl-6 pr-3 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Principal Component (Read Only / Calculated) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                    Principal Part
                                </label>
                                <div className="relative opacity-70">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                    <input
                                        type="text"
                                        value={principalComponent}
                                        readOnly
                                        className="w-full h-10 pl-6 pr-3 bg-gray-100 dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed font-bold text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date & Method */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full h-10 pl-9 pr-3 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Method
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full h-10 pl-9 pr-3 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all appearance-none"
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
                            className="w-full h-20 p-3 bg-gray-50 dark:bg-[#2C3035] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-sm text-gray-900 dark:text-white transition-all resize-none"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#2C3035]/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const SlidersHorizontalIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="21" x2="14" y1="4" y2="4" />
        <line x1="10" x2="3" y1="4" y2="4" />
        <line x1="21" x2="12" y1="12" y2="12" />
        <line x1="8" x2="3" y1="12" y2="12" />
        <line x1="21" x2="16" y1="20" y2="20" />
        <line x1="12" x2="3" y1="20" y2="20" />
        <line x1="14" x2="14" y1="2" y2="6" />
        <line x1="8" x2="8" y1="10" y2="14" />
        <line x1="16" x2="16" y1="18" y2="22" />
    </svg>
);

export default PartialPaymentModal;

