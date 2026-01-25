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
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="font-display font-black uppercase tracking-widest text-xs">Syncing Market Data...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bottom-[76px] flex flex-col bg-gray-50 dark:bg-[#0F1113] overflow-hidden font-display select-none">
            {/* Header */}
            <header className="flex-none px-6 pt-10 pb-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/20 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                            Market Rates
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">Daily Metal Quotations</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {jewelTypes.filter(t => ['Gold', 'Silver'].includes(t.name)).map((type) => (
                        <div key={type.id} className="bg-white dark:bg-[#1A1D1F] p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            {/* Decorative Background Icon */}
                            <span className="absolute -bottom-10 -right-10 material-symbols-outlined text-[120px] opacity-[0.03] dark:opacity-[0.07] transform -rotate-12 transition-transform group-hover:scale-110">
                                {type.name === 'Gold' ? 'monetization_on' : 'savings'}
                            </span>

                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform transition-all group-hover:rotate-3 ${type.name === 'Gold'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                    }`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {type.name === 'Gold' ? 'monetization_on' : 'savings'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{type.name}</h3>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Pure Hallmark</p>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                        Market Price (₹ / Gram)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter rate..."
                                            defaultValue={type.metal_rate?.rate || ""}
                                            className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-2xl font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
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
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                Active Feed
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">history</span>
                                            {type.metal_rate?.updated_at ? new Date(type.metal_rate.updated_at).toLocaleTimeString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Sticky Summary Bar */}
            <footer className="flex-none px-6 py-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-20">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Global Market Sync Active</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">© Auralendr Intelligence</span>
                </div>
            </footer>
        </div>
    );
};

export default MetalRates;
