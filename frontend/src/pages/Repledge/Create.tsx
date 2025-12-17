import React from "react";
import { useNavigate } from "react-router-dom";
import { useRepledge } from "../../hooks/useRepledge";
import http from "../../api/http";
import RepledgeForm from "../../components/Repledge/RepledgeForm";
import { useToast } from "../../context";

const Create: React.FC = () => {
    const navigate = useNavigate();
    const { saveRepledgeEntry } = useRepledge();
    const { showToast } = useToast();

    const handleSubmit = async (data: any) => {
        try {
            await saveRepledgeEntry(data);
            showToast("Repledge created successfully", "success");
            navigate("/repledge");
        } catch (error) {
            console.error(error);
            showToast("Failed to create repledge", "error");
        }
    };

    const [metalRates, setMetalRates] = React.useState<{ gold: string; silver: string }>({ gold: "", silver: "" });

    React.useEffect(() => {
        // Fetch metal rates
        http.get("/metal-rates").then(res => {
            const rates = res.data;
            const gold = rates.find((r: any) => r.name === 'Gold')?.metal_rate?.rate || "";
            const silver = rates.find((r: any) => r.name === 'Silver')?.metal_rate?.rate || "";
            setMetalRates({ gold, silver });
        }).catch(console.error);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#f7f8fc] dark:bg-gray-900">
            <header className="flex-none flex items-center justify-between bg-white dark:bg-gray-900 p-4 shadow-sm border-b border-gray-200 dark:border-gray-800 z-10 gap-4 sticky top-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-white">arrow_back</span>
                </button>

                <div className="flex-1 flex justify-center">
                    <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center whitespace-nowrap">Create Repledge</h2>
                </div>

                {(metalRates.gold || metalRates.silver) ? (
                    <div className="flex items-center gap-3 text-xs md:text-sm font-medium bg-gradient-to-r from-amber-50/50 to-slate-50/50 dark:from-amber-900/10 dark:to-slate-900/10 px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/30 shadow-sm transition-all hover:shadow-md cursor-default group shrink-0">
                        {metalRates.gold && (
                            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 duration-1000"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                                <span className="hidden sm:inline">Gold:</span>
                                <span className="sm:hidden">G:</span>
                                ₹{metalRates.gold}
                            </span>
                        )}
                        {metalRates.silver && (
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 border-l border-gray-200 dark:border-gray-700/50 pl-3">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75 duration-1000 delay-300"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
                                </span>
                                <span className="hidden sm:inline">Silver:</span>
                                <span className="sm:hidden">S:</span>
                                ₹{metalRates.silver}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="w-10 shrink-0"></div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-5xl mx-auto w-full">
                <RepledgeForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
            </main>
        </div>
    );
};

export default Create;
