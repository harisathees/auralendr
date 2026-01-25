import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import { Link } from "react-router-dom";
import { useToast } from "../../../context";

import type { Branch, JewelType, ProcessingFee } from "../../../types/models";

const ProcessingFees: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [jewelTypes, setJewelTypes] = useState<JewelType[]>([]);
    const [processingFees, setProcessingFees] = useState<ProcessingFee[]>([]);

    const [selectedBranchId, setSelectedBranchId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null); // storing jewel_type_id being saved
    const { showToast } = useToast();

    // Fetch initial data (Branches and Jewel Types)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [branchesRes, typesRes] = await Promise.all([
                    api.get("/branches"),
                    api.get("/jewel-types")
                ]);
                setBranches(branchesRes.data);
                setJewelTypes(typesRes.data);

                // Select first branch by default if available
                if (branchesRes.data.length > 0) {
                    setSelectedBranchId(branchesRes.data[0].id.toString());
                }
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                showToast("Failed to load initial data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch processing fees when branch changes
    useEffect(() => {
        // if (!selectedBranchId) return; // Allow fetching if we have a strategy for "Global"

        const fetchFees = async () => {
            try {
                // Handle "GLOBAL" or empty branch ID
                const branchParam = selectedBranchId === "GLOBAL" ? "null" : selectedBranchId;
                const res = await api.get(`/processing-fees?branch_id=${branchParam}`);
                setProcessingFees(res.data);
            } catch (error) {
                console.error("Failed to fetch processing fees", error);
                showToast("Failed to load processing fees", "error");
            }
        };

        fetchFees();
    }, [selectedBranchId]);

    const getFeeForType = (typeId: number) => {
        const targetBranchId = selectedBranchId === "GLOBAL" ? null : selectedBranchId;
        const fee = processingFees.find(f => f.jewel_type_id === typeId && f.branch_id === targetBranchId);
        return {
            percentage: fee?.percentage || "",
            max_amount: fee?.max_amount || ""
        };
    };

    const handleSave = async (jewelTypeId: number, percentage: string, maxAmount: string) => {
        if (!selectedBranchId) return;
        setSaving(jewelTypeId);

        try {
            const payload = {
                jewel_type_id: jewelTypeId,
                branch_id: selectedBranchId === "GLOBAL" ? null : selectedBranchId,
                percentage: parseFloat(percentage),
                max_amount: maxAmount ? parseFloat(maxAmount) : null
            };

            const res = await api.post("/processing-fees", payload);

            // Update local state
            setProcessingFees(prev => {
                const targetBranchId = selectedBranchId === "GLOBAL" ? null : selectedBranchId;
                const existingIndex = prev.findIndex(f => f.jewel_type_id === jewelTypeId && f.branch_id === targetBranchId);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = res.data;
                    return updated;
                } else {
                    return [...prev, res.data];
                }
            });
            showToast("Processing fee updated successfully", "success");

        } catch (error) {
            console.error("Failed to save processing fee", error);
            showToast("Failed to save processing fee", "error");
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="flex items-center justify-between mb-6 flex-none">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link to="/admin/configurations" className="text-secondary-text dark:text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                            Processing Fees
                        </h2>
                    </div>
                    {/* <p className="text-secondary-text dark:text-gray-400 ml-8">Configure fees per Branch & Jewel Type</p> */}
                </div>

                {/* Branch Selector */}
                <div className="flex items-center gap-3">
                    {/* <span className="text-sm font-medium text-secondary-text dark:text-gray-400">Select Branch:</span> */}
                    <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="form-select h-10 rounded-lg border-border-green bg-white dark:bg-gray-800 px-4 text-sm text-primary-text dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                    >
                        <option value="GLOBAL">All Branches (Global)</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.branch_name}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jewelTypes.map(type => (
                        <div key={`${type.id}-${selectedBranchId}`} className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">diamond</span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-text dark:text-white">{type.name}</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-text dark:text-gray-400 mb-1">
                                        Processing Fee configuration
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-secondary-text mb-1">Percentage (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={getFeeForType(type.id).percentage}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    const current = getFeeForType(type.id);
                                                    if (val !== current.percentage) {
                                                        handleSave(type.id, val || "0", current.max_amount);
                                                    }
                                                }}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-primary-text dark:text-white"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-secondary-text mb-1">Max Limit (₹)</label>
                                            <input
                                                type="number"
                                                step="1"
                                                defaultValue={getFeeForType(type.id).max_amount}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    const current = getFeeForType(type.id);
                                                    if (val !== current.max_amount) {
                                                        handleSave(type.id, current.percentage || "0", val);
                                                    }
                                                }}
                                                placeholder="Optional"
                                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-primary-text dark:text-white"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center w-8 pt-5 text-secondary-text">
                                            {saving === type.id ? (
                                                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-secondary-text mt-2">
                                        Auto-saved on blur.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProcessingFees;
