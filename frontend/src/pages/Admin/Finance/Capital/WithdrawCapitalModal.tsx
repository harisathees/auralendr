import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import { useToast } from "../../../../context/Toast/ToastContext";

interface WithdrawCapitalModalProps {
    source: any;
    onSuccess: () => void;
    onCancel: () => void;
}

const WithdrawCapitalModal: React.FC<WithdrawCapitalModalProps> = ({ source, onSuccess, onCancel }) => {
    const { showToast } = useToast();
    const [amount, setAmount] = useState("");
    const [moneySourceId, setMoneySourceId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState("");

    const [moneySources, setMoneySources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMoneySources();
    }, []);

    const fetchMoneySources = async () => {
        try {
            const res = await api.get("/money-sources");
            // Filter active outbound sources (can pay from)
            const activeSources = res.data.filter((s: any) => s.is_active && s.is_outbound);
            setMoneySources(activeSources);
            if (activeSources.length > 0) {
                setMoneySourceId(activeSources[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch money sources");
        }
    };

    const handleSubmit = async () => {
        if (!amount || !moneySourceId || !date) return;

        setLoading(true);
        try {
            await api.post("/capital-sources/withdraw-capital", {
                capital_source_id: source.id,
                money_source_id: moneySourceId,
                amount: parseFloat(amount),
                date,
                description
            });
            showToast("Capital withdrawn successfully", "success");
            onSuccess();
        } catch (err: any) {
            console.error("Failed to withdraw capital", err);
            showToast(err.response?.data?.message || "Failed to withdraw capital", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-red-50/50 dark:bg-red-900/20">
                <h2 className="text-lg font-bold text-primary-text dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">remove_circle</span>
                    Withdraw Capital
                </h2>
                <p className="text-xs text-secondary-text dark:text-gray-400 mt-1">
                    To <span className="font-bold text-gray-900 dark:text-white">{source.name}</span>
                </p>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Amount (₹)</span>
                    <input
                        type="number"
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 h-12 px-4 text-lg font-bold outline-none transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Withdraw From</span>
                        <div className="relative">
                            <select
                                className="form-select w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none appearance-none transition-all"
                                value={moneySourceId}
                                onChange={(e) => setMoneySourceId(e.target.value)}
                            >
                                {moneySources.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (₹{parseFloat(s.balance).toLocaleString()})</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Date</span>
                        <input
                            type="date"
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Note / Reference</span>
                    <input
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Dividend payout, Partial withdrawal"
                    />
                </label>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !amount}
                        className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Confirm Withdrawal"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawCapitalModal;
