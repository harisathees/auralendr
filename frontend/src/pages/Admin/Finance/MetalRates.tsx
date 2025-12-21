import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";
import { useToast } from "../../../context/Toast/ToastContext";

import type { JewelType } from "../../../types/models";

const MetalRates: React.FC = () => {
    const [jewelTypes, setJewelTypes] = useState<JewelType[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            setLoading(true);
            const response = await api.get("/metal-rates");
            setJewelTypes(response.data);
        } catch (error) {
            console.error("Failed to fetch metal rates", error);
            toast.error("Failed to load metal rates");
        } finally {
            setLoading(false);
        }
    };

    const handleRateUpdate = async (typeId: number, rate: string) => {
        try {
            await api.post("/metal-rates", {
                jewel_type_id: typeId,
                rate: rate
            });
            toast.success("Rate updated successfully");
            fetchRates(); // Refresh to see updated time/value
        } catch (error) {
            console.error("Failed to update rate", error);
            toast.error("Failed to update rate");
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading rates...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Metal Rates
                    </h2>
                    <p className="text-secondary-text dark:text-gray-400">Update daily rates for Gold and Silver.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jewelTypes.filter(t => ['Gold', 'Silver'].includes(t.name)).map((type) => (
                    <div key={type.id} className="bg-card-light dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${type.name === 'Gold' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {type.name === 'Gold' ? 'monetization_on' : 'savings'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary-text dark:text-white">{type.name}</h3>
                                <p className="text-sm text-secondary-text dark:text-gray-400">Rate per gram</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-text dark:text-gray-400 mb-1">
                                    Current Rate (₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    defaultValue={type.metal_rate?.rate || ""}
                                    className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-display font-medium"
                                    onBlur={(e) => {
                                        const val = e.target.value;
                                        if (val && val !== type.metal_rate?.rate) {
                                            handleRateUpdate(type.id, val);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            handleRateUpdate(type.id, target.value);
                                            target.blur();
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">update</span>
                                    Last updated: {type.metal_rate?.updated_at ? new Date(type.metal_rate.updated_at).toLocaleString() : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MetalRates;
