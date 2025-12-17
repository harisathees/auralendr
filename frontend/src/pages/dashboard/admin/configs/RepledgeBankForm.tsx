import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { RepledgeBank, Branch } from "../../../../types/models";

interface RepledgeBankFormProps {
    initialData: RepledgeBank | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RepledgeBankForm: React.FC<RepledgeBankFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [branchName, setBranchName] = useState(""); // This is the 'branch' text field in DB
    const [defaultInterest, setDefaultInterest] = useState("");
    const [validityMonths, setValidityMonths] = useState("");
    const [postValidityInterest, setPostValidityInterest] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // Branch assignment
    const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
    const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch available branches
        http.get("/branches").then(res => {
            if (Array.isArray(res.data)) {
                setAvailableBranches(res.data);
            } else if (res.data.data && Array.isArray(res.data.data)) {
                // Handle paginated response if any
                setAvailableBranches(res.data.data);
            }
        }).catch(err => console.error("Failed to fetch branches", err));

        if (initialData) {
            setName(initialData.name);
            setCode(initialData.code || "");
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
            setCode("");
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
            code,
            branch: branchName,
            default_interest: parseFloat(defaultInterest) || 0,
            validity_months: parseInt(validityMonths) || 0,
            post_validity_interest: parseFloat(postValidityInterest) || 0,
            payment_method: paymentMethod,
            branch_ids: selectedBranchIds
        };

        try {
            if (initialData) {
                await http.put(`/repledge-banks/${initialData.id}`, payload);
            } else {
                await http.post("/repledge-banks", payload);
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save repledge bank", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {initialData ? "Edit Repledge Bank" : "Add Repledge Bank"}
                </h2>
                <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Bank Name</span>
                    <input
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. State Bank of India"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Bank Code</span>
                        <input
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Optional"
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
                        <input
                            className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            placeholder="e.g. Cash"
                        />
                    </label>
                </div>

                {/* Branch Selection */}
                <div className="flex flex-col gap-2 pt-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Assign to Branches</span>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        {availableBranches.length === 0 ? (
                            <p className="text-xs text-gray-500 col-span-2 text-center py-2">No branches available</p>
                        ) : (
                            availableBranches.map(branch => (
                                <label key={branch.id} className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedBranchIds.includes(branch.id)}
                                        onChange={() => toggleBranch(branch.id)}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{branch.branch_name}</span>
                                </label>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-gray-500">Selected branches will have access to this repledge bank.</p>
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
                        {loading ? "Saving..." : "Save Bank"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepledgeBankForm;
