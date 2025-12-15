import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { MoneySource, Branch } from "../../../../types/models";

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

    // Branch Selection
    const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
    const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await http.get("/branches");
            setAvailableBranches(res.data);
        } catch (err) {
            console.error("Failed to fetch branches");
        }
    };

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

            // Pre-select branches if editing
            if (initialData.branches) {
                setSelectedBranchIds(initialData.branches.map(b => b.id));
            }
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
            setSelectedBranchIds([]);
        }
    }, [initialData]);

    const handleBranchToggle = (branchId: number) => {
        if (selectedBranchIds.includes(branchId)) {
            setSelectedBranchIds(selectedBranchIds.filter(id => id !== branchId));
        } else {
            setSelectedBranchIds([...selectedBranchIds, branchId]);
        }
    };

    const handleSelectAllBranches = () => {
        if (selectedBranchIds.length === availableBranches.length) {
            setSelectedBranchIds([]);
        } else {
            setSelectedBranchIds(availableBranches.map(b => b.id));
        }
    };

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
            show_balance: showBalance,
            branch_ids: selectedBranchIds
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {initialData ? "Edit Payment Method" : "Add Payment Method"}
                </h2>
                <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
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

                {/* Branch Selection */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Assign to Branches</span>
                        <button
                            type="button"
                            onClick={handleSelectAllBranches}
                            className="text-xs text-primary font-bold hover:underline"
                        >
                            {selectedBranchIds.length === availableBranches.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                        {availableBranches.map(branch => {
                            const isSelected = selectedBranchIds.includes(branch.id);
                            return (
                                <label key={branch.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 group ${isSelected
                                    ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-sm'
                                    : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-[14px] font-bold">store</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleBranchToggle(branch.id)}
                                        className="hidden" // Hiding default checkbox, using the card state
                                    />
                                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-primary-dark dark:text-primary' : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {branch.branch_name}
                                    </span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-[14px] text-primary ml-auto">check</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Description</span>
                    <textarea
                        className="form-textarea w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm outline-none min-h-[80px] resize-none transition-all"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional details..."
                    />
                </label>

                <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {/* Outbound */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isOutbound ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isOutbound ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            </div>
                            <span className={`text-xs font-bold ${isOutbound ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>Can Send</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isOutbound}
                            onChange={(e) => setIsOutbound(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    </label>

                    {/* Inbound */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isInbound ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isInbound ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                            </div>
                            <span className={`text-xs font-bold ${isInbound ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500'}`}>Can Receive</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isInbound}
                            onChange={(e) => setIsInbound(e.target.checked)}
                            className="w-3.5 h-3.5 text-purple-600 rounded focus:ring-purple-500"
                        />
                    </label>

                    {/* Active Status */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>Active</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-3.5 h-3.5 text-green-600 rounded focus:ring-green-500"
                        />
                    </label>

                    {/* Show Balance */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${showBalance ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${showBalance ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </div>
                            <span className={`text-xs font-bold ${showBalance ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>Show Bal</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={showBalance}
                            onChange={(e) => setShowBalance(e.target.checked)}
                            className="w-3.5 h-3.5 text-amber-600 rounded focus:ring-amber-500"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 mb-4">
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
