import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";

interface CapitalSourceFormProps {
    initialData: any | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CapitalSourceForm: React.FC<CapitalSourceFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("owner");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setDescription(initialData.description || "");
        }
    }, [initialData]);

    const handleSubmit = async () => {
        if (!name) return;

        setLoading(true);
        const payload = { name, type, description };

        try {
            if (initialData) {
                await api.put(`/capital-sources/${initialData.id}`, payload);
            } else {
                await api.post("/capital-sources", payload);
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save capital source", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {initialData ? "Edit Capital Source" : "New Capital Source"}
                </h2>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Source Name</span>
                    <input
                        className="form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe, HDFC Loan"
                        autoFocus
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Type</span>
                    <div className="relative">
                        <select
                            className="form-select w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none appearance-none transition-all"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="owner">Owner / Partner</option>
                            <option value="investor">External Investor</option>
                            <option value="bank_loan">Bank Loan / Credit Line</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                    </div>
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Description</span>
                    <textarea
                        className="form-textarea w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm outline-none min-h-[80px] resize-none transition-all"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional details..."
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
                        disabled={loading || !name}
                        className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Source"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CapitalSourceForm;
