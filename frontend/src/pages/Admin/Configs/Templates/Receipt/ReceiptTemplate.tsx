import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import apiClient from "../../../../../api/apiClient";

interface ReceiptConfig {
    type: "standard" | "dynamic";
    size: "A4" | "A5" | "A6" | "A6 Landscape" | "Thermal";
    alignment: "left" | "center" | "right";
    title: string;
    header: string;
    footer: string;
    show_logo: boolean;
}

const ReceiptTemplate: React.FC = () => {
    const { register, handleSubmit, watch, setValue } = useForm<ReceiptConfig>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [scale, setScale] = useState(1);

    // Refs for scaling calculation
    const containerRef = React.useRef<HTMLDivElement>(null);
    const paperRef = React.useRef<HTMLDivElement>(null);

    const type = watch("type", "standard");
    const size = watch("size", "A4");
    const alignment = watch("alignment", "left");
    const title = watch("title", "RECEIPT");
    const header = watch("header", "");
    const footer = watch("footer", "Thank you for your business!");

    // Paper dimensions in mm
    const paperDimensions = {
        'A4': { width: 210, height: 297 },
        'A5': { width: 148, height: 210 },
        'A6': { width: 105, height: 148 },
        'A6 Landscape': { width: 148, height: 105 },
        'Thermal': { width: 80, height: 200 }, // Variable height realistically, but fixed for preview base
    };

    const currentDim = paperDimensions[size as keyof typeof paperDimensions] || paperDimensions['A4'];

    useEffect(() => {
        const calculateScale = () => {
            if (containerRef.current && paperRef.current) {
                // Get container width minus padding (approx 64px total horizontal padding from p-8)
                const containerWidth = containerRef.current.clientWidth - 64;

                // Convert mm to pixels (approx 3.78 px per mm)
                const paperWidthPx = currentDim.width * 3.78;

                if (paperWidthPx > containerWidth) {
                    const newScale = containerWidth / paperWidthPx;
                    setScale(newScale);
                } else {
                    setScale(1);
                }
            }
        };

        // Calculate initially
        calculateScale();

        // Calculate on resize
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [size, currentDim.width]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get("/templates/receipt");
                const config = response.data;
                setValue("type", config.type || "standard");
                setValue("size", config.size || "A4");
                setValue("alignment", config.alignment || "left");
                setValue("title", config.title || "RECEIPT");
                setValue("header", config.header || "");
                setValue("footer", config.footer || "Thank you for your business!");
                setValue("show_logo", config.show_logo ?? true);
            } catch (error) {
                console.error("Failed to fetch receipt config", error);
                toast.error("Failed to load settings");
            } finally {
                setFetching(false);
            }
        };

        fetchConfig();
    }, [setValue]);

    const onSubmit = async (data: ReceiptConfig) => {
        setLoading(true);
        try {
            await apiClient.post("/templates/receipt", data);
            toast.success("Receipt settings saved successfully");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-60">
            {/* Header: Normal flow (not sticky) to avoid overlapping with global nav */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-[1920px] mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Receipt Template</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure how your receipts look and print.</p>
                    </div>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined">save</span>}
                        Save Configuration
                    </button>
                </div>
            </header>

            <div className="max-w-[1920px] mx-auto w-full px-6 lg:px-8">
                <form className="grid grid-cols-12 gap-8 items-start">
                    {/* Configuration Column - Sidebar */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">

                            {/* Template Type */}
                            <section className="mb-8">
                                <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">style</span>
                                    Template Type
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`
                                        cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all text-center
                                        ${type === 'standard' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-200'}
                                    `}>
                                        <input {...register("type")} type="radio" value="standard" className="hidden" />
                                        <span className="material-symbols-outlined text-3xl text-gray-600 dark:text-gray-300">print</span>
                                        <div className="leading-tight">
                                            <span className="block font-semibold text-gray-700 dark:text-gray-200 text-sm">Standard</span>
                                            <span className="block text-[10px] text-gray-500 mt-0.5">Pre-printed</span>
                                        </div>
                                    </label>

                                    <label className={`
                                        cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all text-center
                                        ${type === 'dynamic' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-200'}
                                    `}>
                                        <input {...register("type")} type="radio" value="dynamic" className="hidden" />
                                        <span className="material-symbols-outlined text-3xl text-gray-600 dark:text-gray-300">wysiwyg</span>
                                        <div className="leading-tight">
                                            <span className="block font-semibold text-gray-700 dark:text-gray-200 text-sm">Dynamic</span>
                                            <span className="block text-[10px] text-gray-500 mt-0.5">Customizable</span>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            {type === 'standard' && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-xs border border-amber-200 dark:border-amber-800 flex gap-2 leading-relaxed">
                                    <span className="material-symbols-outlined text-base shrink-0">info</span>
                                    <p>Standard mode uses the legacy fixed-layout receipt designed for pre-printed custom stationery. Customizations are disabled.</p>
                                </div>
                            )}

                            {/* Dynamic Settings */}
                            {type === 'dynamic' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
                                    <hr className="border-gray-100 dark:border-gray-700" />

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Paper Size</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['A4', 'A5', 'A6', 'A6 Landscape', 'Thermal'].map((opt) => (
                                                <label key={opt} className={`
                                                    cursor-pointer border rounded-lg py-2 px-1 text-center text-xs font-bold transition-colors
                                                    ${size === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100'}
                                                `}>
                                                    <input {...register("size")} type="radio" value={opt} className="hidden" />
                                                    {opt === 'A6 Landscape' ? 'A6 Land.' : opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Alignment</label>
                                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                            {['left', 'center', 'right'].map((align) => (
                                                <label key={align} className={`flex-1 cursor-pointer rounded-md py-1.5 text-center transition-all capitalize text-xs font-medium ${alignment === align ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                                                    <input {...register("alignment")} type="radio" value={align} className="hidden" />
                                                    {align}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Receipt Title</label>
                                            <input {...register("title")} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm transition-colors" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Header Text</label>
                                            <textarea {...register("header")} rows={3} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm transition-colors" placeholder="Company Address..." />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Footer Text</label>
                                            <textarea {...register("footer")} rows={3} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm transition-colors" placeholder="Thank you..." />
                                        </div>

                                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                            <input type="checkbox" {...register("show_logo")} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Company Logo</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Column - Main Content */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                        <div
                            ref={containerRef}
                            className="bg-gray-200 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 p-8 min-h-[calc(100vh-200px)] flex flex-col items-center relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Preview {scale < 1 && <span className="text-amber-500 ml-1">({Math.round(scale * 100)}%)</span>}
                            </div>

                            {/* Wrapper to handle scaled height space */}
                            <div
                                style={{
                                    width: `${currentDim.width}mm`,
                                    height: `${currentDim.height}mm`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top center',
                                    marginBottom: `-${(1 - scale) * currentDim.height}mm` // Pull up bottom space
                                }}
                            >
                                <div
                                    ref={paperRef}
                                    className={`
                                        bg-white text-black shadow-2xl transition-all duration-300 h-full w-full
                                        ${type === 'standard' ? 'opacity-50 grayscale' : ''}
                                    `}
                                    style={{
                                        padding: size === 'Thermal' ? '5mm' : '15mm',
                                        textAlign: alignment,
                                        fontSize: size === 'Thermal' ? '12px' : '14px',
                                    }}
                                >
                                    {type === 'standard' ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 h-full">
                                            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">print_disabled</span>
                                            <p className="text-gray-400 font-bold text-lg">Preview Unavailable</p>
                                            <p className="text-sm text-gray-400 mt-2 max-w-xs">Standard templates depend on pre-printed stationery dimensions.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            {/* Mock Header */}
                                            <div className="mb-6 border-b-2 border-black pb-4">
                                                {watch("show_logo") && (
                                                    <div className="bg-gray-200 w-12 h-12 mb-3 rounded-full flex items-center justify-center mx-auto text-xs font-bold text-gray-500">LOGO</div>
                                                )}
                                                <h2 className="text-xl font-bold uppercase tracking-wider mb-2 leading-none">{title}</h2>
                                                <div className="text-sm opacity-70 whitespace-pre-wrap leading-snug">{header || "Your Company Header Here..."}</div>
                                            </div>

                                            {size !== 'A6 Landscape' && (
                                                <>
                                                    {/* Mock Metadata */}
                                                    <div className="flex justify-between text-xs mb-6 opacity-80 text-left">
                                                        <div>
                                                            <p><span className="font-bold">Date:</span> 23/12/2025</p>
                                                            <p><span className="font-bold">Receipt No:</span> #1024</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p><span className="font-bold">Customer:</span> John Doe</p>
                                                            <p><span className="font-bold">ID:</span> 9876543210</p>
                                                        </div>
                                                    </div>

                                                    {/* Mock Content Body */}
                                                    <div className="space-y-4 text-left font-mono my-8 flex-1">
                                                        <div className="flex justify-between border-b border-black pb-1 font-bold">
                                                            <span>Description</span>
                                                            <span>Amount</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <span>Gold Ring (22k)</span>
                                                                <div className="text-xs opacity-50">9.5g | No damage</div>
                                                            </div>
                                                            <span>$12,000.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs opacity-70">
                                                            <span>Processing Fee</span>
                                                            <span>$50.00</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold pt-2 border-t border-black mt-2 text-base">
                                                            <span>TOTAL</span>
                                                            <span>$12,050.00</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Mock Footer */}
                                            <div className="mt-8 pt-4 border-t border-black text-xs opacity-60 whitespace-pre-wrap">
                                                {footer || "Footer text will appear here..."}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiptTemplate;
