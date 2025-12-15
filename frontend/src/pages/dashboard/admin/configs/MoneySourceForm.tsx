import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { MoneySource } from "../../../../types/models";

interface MoneySourceFormProps {
    initialData: MoneySource | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const MoneySourceForm: React.FC<MoneySourceFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("cash");
    const [balance, setBalance] = useState("0");
    const [description, setDescription] = useState("");

    // Checkboxes
    const [isOutbound, setIsOutbound] = useState(true);
    const [isInbound, setIsInbound] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [showBalance, setShowBalance] = useState(true);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setBalance(initialData.balance);
            setDescription(initialData.description || "");
            setIsOutbound(initialData.is_outbound !== false);
            setIsInbound(initialData.is_inbound !== false);
            setIsActive(initialData.is_active !== false);
            setShowBalance(initialData.show_balance !== false);
        } else {
            // Reset defaults for new
            setName("");
            setType("cash");
            setBalance("0");
            setDescription("");
            setIsOutbound(true);
            setIsInbound(true);
            setIsActive(true);
            setShowBalance(true);
        }
    }, [initialData]);

    const handleSubmit = async () => {
        if (!name || !balance) return;

        setLoading(true);
        const payload = {
            name,
            type,
            balance,
            description,
            is_outbound: isOutbound,
            is_inbound: isInbound,
            is_active: isActive,
            show_balance: showBalance
        };

        try {
            if (initialData) {
                await http.put(`/money-sources/${initialData.id}`, payload);
            } else {
                await http.post("/money-sources", payload);
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save money source", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {initialData ? "Edit Payment Method" : "Add Payment Method"}
                </h2>
                <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Name</span>
                    <input
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Shop Cash, HDFC Bank"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Type</span>
                        <div className="relative">
                            <select
                                className="form-select w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none appearance-none transition-all"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Account</option>
                                <option value="wallet">Wallet / UPI</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Opening Balance</span>
                        <input
                            type="number"
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="0.00"
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Description</span>
                    <textarea
                        className="form-textarea w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm outline-none min-h-[100px] resize-none transition-all"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional details..."
                    />
                </label>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {/* Outbound */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isOutbound ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOutbound ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-lg">arrow_upward</span>
                            </div>
                            <span className={`text-sm font-bold ${isOutbound ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>Can Send</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isOutbound}
                            onChange={(e) => setIsOutbound(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </label>

                    {/* Inbound */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isInbound ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isInbound ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-lg">arrow_downward</span>
                            </div>
                            <span className={`text-sm font-bold ${isInbound ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500'}`}>Can Receive</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isInbound}
                            onChange={(e) => setIsInbound(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                    </label>

                    {/* Active Status */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                            </div>
                            <span className={`text-sm font-bold ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>Active</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                    </label>

                    {/* Show Balance */}
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${showBalance ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showBalance ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-lg">visibility</span>
                            </div>
                            <span className={`text-sm font-bold ${showBalance ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>Show Bal</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={showBalance}
                            onChange={(e) => setShowBalance(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Payment Method"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoneySourceForm;
