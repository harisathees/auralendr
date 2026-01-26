import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface PaperPreset {
    name: string;
    width: number;
    height: number;
    icon: string;
    description: string;
}

const PRESETS: PaperPreset[] = [
    { name: "A4", width: 210, height: 297, icon: "description", description: "Standard business document" },
    { name: "A5", width: 148, height: 210, icon: "article", description: "Half-size compact receipt" },
    { name: "A6", width: 105, height: 148, icon: "sticky_note_2", description: "Small pocket receipt" },
    { name: "Thermal", width: 80, height: 200, icon: "receipt", description: "80mm Point of Sale roll" },
    { name: "Custom", width: 80, height: 80, icon: "dashboard_customize", description: "Your own dimensions" },
];

const ReceiptLayoutSelector: React.FC = () => {
    const navigate = useNavigate();
    const [width, setWidth] = useState<number>(210);
    const [height, setHeight] = useState<number>(297);
    const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
    const [activePreset, setActivePreset] = useState<string>("A4");

    const handlePresetSelect = (preset: PaperPreset) => {
        if (preset.name !== "Custom") {
            setWidth(preset.width);
            setHeight(preset.height);
        }
        setActivePreset(preset.name);
    };

    const handleContinue = () => {
        // Navigate to designer with dimensions and orientation
        navigate(`/admin/configs/templates/receipt/designer?w=${width}&h=${height}&o=${orientation}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 md:p-8 flex items-center justify-center font-outfit">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Visual Guide / Illustration Areas */}
                <div className="hidden lg:flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="relative">
                        {/* Background glow */}
                        <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full"></div>

                        {/* Dynamic Paper Preview Container */}
                        <div
                            className="relative bg-white dark:bg-slate-800 shadow-2xl rounded-sm border border-slate-200 dark:border-slate-700 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center"
                            style={{
                                width: orientation === "portrait" ? "200px" : "280px",
                                height: orientation === "portrait" ? "280px" : "200px",
                                transform: `scale(${Math.min(1, 200 / Math.max(width, height))})`,
                            }}
                        >
                            <div className="absolute inset-0 opacity-10 pattern-grid"></div>
                            <div className="w-full h-1/4 border-b border-dashed border-blue-500/20 mb-4"></div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-6"></div>
                            <div className="w-2/3 h-2 bg-slate-100 dark:bg-slate-700 mb-2"></div>
                            <div className="w-1/2 h-2 bg-slate-100 dark:bg-slate-700 mb-8"></div>
                            <div className="w-3/4 h-32 border border-dashed border-blue-500/30 rounded"></div>
                        </div>

                        {/* Dimensions Overlay */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                            {orientation === "portrait" ? `${width}mm × ${height}mm` : `${height}mm × ${width}mm`}
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Setup Layout</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Pick a foundation for your masterpiece</p>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="mb-8">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">straighten</span>
                            </span>
                            Canvas Dimensions
                        </h1>
                    </div>

                    <div className="space-y-8">
                        {/* Preset Grid */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Choose Preset</label>
                            <div className="grid grid-cols-2 gap-3">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => handlePresetSelect(preset)}
                                        className={`
                                            group flex flex-col p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden
                                            ${activePreset === preset.name
                                                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                                                : "border-slate-50 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
                                            }
                                        `}
                                    >
                                        <span className={`material-symbols-outlined mb-3 ${activePreset === preset.name ? "text-blue-600" : "text-slate-400 group-hover:text-blue-400"}`}>
                                            {preset.icon}
                                        </span>
                                        <div className="font-black text-slate-800 dark:text-slate-200 leading-none mb-1">{preset.name}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold">{preset.width}x{preset.height}mm</div>

                                        {activePreset === preset.name && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-6 h-6 bg-blue-600 rounded-bl-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xs">done</span>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Inputs */}
                        {activePreset === "Custom" && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2">Width (mm)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MM</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2">Height (mm)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MM</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orientation */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Orientation</label>
                            <div className="flex bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 gap-2">
                                <button
                                    onClick={() => setOrientation("portrait")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs ${orientation === "portrait" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <span className="material-symbols-outlined text-lg">crop_portrait</span>
                                    Portrait
                                </button>
                                <button
                                    onClick={() => setOrientation("landscape")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs ${orientation === "landscape" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <span className="material-symbols-outlined text-lg">crop_landscape</span>
                                    Landscape
                                </button>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-4">
                            <button
                                onClick={handleContinue}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs h-16 rounded-[24px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Continue to Designer
                                <span className="material-symbols-outlined">east</span>
                            </button>
                            <Link
                                to="/admin/configs/templates/receipt"
                                className="w-full mt-4 flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 uppercase tracking-[2px] transition-colors"
                            >
                                Cancel & Return
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .pattern-grid {
                    background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
                    background-size: 16px 16px;
                }
                .dark .pattern-grid {
                    background-image: radial-gradient(circle, #1e293b 1px, transparent 1px);
                }
            `}} />
        </div>
    );
};

export default ReceiptLayoutSelector;
