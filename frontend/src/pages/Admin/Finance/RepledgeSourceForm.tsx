import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import type { RepledgeSource, Branch } from "../../../types/models";

interface RepledgeSourceFormProps {
    initialData: RepledgeSource | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RepledgeSourceForm: React.FC<RepledgeSourceFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [branchName, setBranchName] = useState(""); // This is the 'branch' text field in DB
    const [defaultInterest, setDefaultInterest] = useState("");
    const [validityMonths, setValidityMonths] = useState("");
    const [postValidityInterest, setPostValidityInterest] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // Branch assignment
    const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
    const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

    // Payment Methods
    const [moneySources, setMoneySources] = useState<import("../../../types/models").MoneySource[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch available branches
        api.get("/api/branches").then(res => {
            if (Array.isArray(res.data)) {
                setAvailableBranches(res.data);
            } else if (res.data.data && Array.isArray(res.data.data)) {
                // Handle paginated response if any
                setAvailableBranches(res.data.data);
            }
        }).catch(err => console.error("Failed to fetch branches", err));

        // Fetch money sources
        api.get("/api/money-sources").then(res => {
            if (Array.isArray(res.data)) {
                setMoneySources(res.data);
            }
        }).catch(err => console.error("Failed to fetch money sources", err));

        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || "");
            setBranchName(initialData.branch || "");
            setDefaultInterest(String(initialData.default_interest));
            setValidityMonths(String(initialData.validity_months));
            setPostValidityInterest(String(initialData.post_validity_interest));
            setPaymentMethod(initialData.payment_method || "");

            // Set selected branches
            if (initialData.branches) {
                setSelectedBranchIds(initialData.branches.map(b => b.id));
            }
        } else {
            setName("");
            setDescription("");
            setBranchName("");
            setDefaultInterest("0");
            setValidityMonths("0");
            setPostValidityInterest("0");
            setPaymentMethod("");
            setSelectedBranchIds([]);
        }
    }, [initialData]);

    const toggleBranch = (branchId: number) => {
        setSelectedBranchIds(prev =>
            prev.includes(branchId)
                ? prev.filter(id => id !== branchId)
                : [...prev, branchId]
        );
    };

    const handleSubmit = async () => {
        if (!name) return;

        setLoading(true);
        const payload = {
            name,
            description,
            branch: branchName,
            default_interest: parseFloat(defaultInterest) || 0,
            validity_months: parseInt(validityMonths) || 0,
            post_validity_interest: parseFloat(postValidityInterest) || 0,
            payment_method: paymentMethod,
            branch_ids: selectedBranchIds
        };

        try {
            if (initialData) {
                await api.put(`/api/repledge-sources/${initialData.id}`, payload);
            } else {
                await api.post("/api/repledge-sources", payload);
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save repledge source", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {initialData ? "Edit Repledge Source" : "Add Repledge Source"}
                </h2>
                <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Source Name</span>
                    <input
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. State Bank of India"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</span>
                        <input
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Branch Name</span>
                        <input
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            placeholder="Optional"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Interest %</span>
                        <input
                            type="number"
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={defaultInterest}
                            onChange={(e) => setDefaultInterest(e.target.value)}
                            placeholder="0.00"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Validity (Months)</span>
                        <input
                            type="number"
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={validityMonths}
                            onChange={(e) => setValidityMonths(e.target.value)}
                            placeholder="0"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Post-Valid Interest %</span>
                        <input
                            type="number"
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={postValidityInterest}
                            onChange={(e) => setPostValidityInterest(e.target.value)}
                            placeholder="0.00"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Default Payment</span>
                        <div className="relative">
                            <select
                                className="form-select w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none appearance-none transition-all"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="" className="text-gray-500">Select Payment Method</option>
                                {moneySources.filter(ms => ms.is_inbound).map(ms => (
                                    <option key={ms.id} value={ms.name} className="bg-white dark:bg-gray-800">
                                        {ms.name}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                        </div>
                    </label>
                </div>

                {/* Branch Selection */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-base font-extrabold text-gray-800 dark:text-gray-100">Assign to Branches</span>
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedBranchIds.length === availableBranches.length) {
                                    setSelectedBranchIds([]);
                                } else {
                                    setSelectedBranchIds(availableBranches.map(b => b.id));
                                }
                            }}
                            className="text-sm text-primary font-semibold hover:text-primary-dark dark:hover:text-primary-light transition-colors"
                        >
                            {selectedBranchIds.length === availableBranches.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {availableBranches.map(branch => {
                            const isSelected = selectedBranchIds.includes(branch.id);
                            return (
                                <div
                                    key={branch.id}
                                    onClick={() => toggleBranch(branch.id)}
                                    className={`aspect-square flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all duration-200 relative ${isSelected
                                        ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/50'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md'
                                        }`}>

                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-primary text-white shadow-inner'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary'
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px]">store</span>
                                    </div>

                                    <span className={`text-[11px] font-medium text-center leading-snug line-clamp-2 ${isSelected
                                        ? 'text-primary-dark dark:text-primary'
                                        : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {branch.branch_name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {availableBranches.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">No branches available</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
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
                        {loading ? "Saving..." : "Save Source"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepledgeSourceForm;
