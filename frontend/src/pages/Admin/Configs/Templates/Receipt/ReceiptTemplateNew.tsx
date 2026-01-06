import React, { useState } from "react";
import { Link } from "react-router-dom";

const ReceiptTemplateNew: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<"layout" | "fields" | "styles">("layout");

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-24">
            {/* Navigation Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/configs"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                                Receipt Designer
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">New</span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Design and customize your transaction receipts</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            Discard
                        </button>
                        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">save</span>
                            Publish Changes
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1920px] mx-auto w-full p-6 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Left Sidebar: Components & Settings */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    {/* Mode Selector */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-1.5 border border-slate-200/60 dark:border-slate-800 flex shadow-sm">
                        {(["layout", "fields", "styles"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`
                                    flex-1 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all
                                    ${selectedTab === tab
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Settings Panel */}
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 overflow-y-auto">
                        <div className="space-y-8">
                            {/* Layout Settings Group */}
                            <section>
                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Paper Configuration</h3>
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Paper Size</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['A4 Standard', 'A5 Compact', 'A6 Receipt', 'Thermal 80mm'].map((size) => (
                                                <button key={size} className="p-3 text-left rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
                                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{size}</span>
                                                    <span className="text-[10px] text-slate-500 italic">210 x 297 mm</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Page Orientation</label>
                                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                            <button className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-xs font-bold text-blue-600">Portrait</button>
                                            <button className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500">Landscape</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section Editor Group */}
                            <section>
                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Visible Sections</h3>
                                <div className="space-y-2">
                                    {['Company Branding', 'Customer Details', 'Pledge Information', 'Payment Summary', 'Terms & Conditions', 'Signature Box'].map((section) => (
                                        <label key={section} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{section}</span>
                                            </div>
                                            <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right Area: Interactive Preview */}
                <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative">
                    {/* Preview Toolbar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                <button className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm"><span className="material-symbols-outlined text-lg">computer</span></button>
                                <button className="p-1.5 rounded-lg text-slate-500"><span className="material-symbols-outlined text-lg">tablet</span></button>
                                <button className="p-1.5 rounded-lg text-slate-500"><span className="material-symbols-outlined text-lg">smartphone</span></button>
                            </div>
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Live Canvas
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_out</span>
                            </button>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">100%</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_in</span>
                            </button>
                        </div>
                    </div>

                    {/* Infinite Canvas */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-12 overflow-auto flex justify-center items-start pattern-grid">
                        <div className="bg-white shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[800px] w-[600px] transform origin-top transition-transform p-12 relative">
                            {/* Watermark/Guide */}
                            <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 pointer-events-none rounded-sm"></div>

                            {/* Receipt Mock Content */}
                            <div className="text-center mb-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 font-bold">LOGO</div>
                                <h2 className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]">Receipt</h2>
                                <p className="text-xs text-slate-500 mt-2">Auralendr Jewelry & Lending Solution</p>
                            </div>

                            <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-bold text-slate-800">Oct 24, 2025</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</p>
                                    <p className="text-sm font-bold text-slate-800">TXN-99281-B2</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</p>
                                    <h4 className="font-bold text-slate-900">Harisathees S.</h4>
                                    <p className="text-xs text-slate-500 mt-1">98765 43210 • Pondicherry, India</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between font-bold text-xs text-slate-400 uppercase tracking-wider px-2">
                                        <span>Item Description</span>
                                        <span>Amount</span>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div className="flex justify-between items-center px-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Gold Bangle (22K)</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">WT: 24.50g • Interest: 2.0%</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">₹ 145,200.00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t-2 border-slate-900 space-y-3">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-xs font-bold">Subtotal</span>
                                    <span className="text-sm">₹ 145,200.00</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-xs font-bold">Processing Fee (1%)</span>
                                    <span className="text-sm">₹ 1,452.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="text-base font-black uppercase text-slate-900">Total Net Loan</span>
                                    <span className="text-xl font-black text-blue-600">₹ 146,652.00</span>
                                </div>
                            </div>

                            <div className="mt-20 flex justify-between gap-12">
                                <div className="flex-1 text-center">
                                    <div className="h-px bg-slate-200 mb-2"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Sign</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="h-px bg-slate-200 mb-2"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Authorized Officer</p>
                                </div>
                            </div>

                            <div className="mt-16 text-center">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        This is a computer-generated receipt. Any disputes must be reported within 24 hours. Interest rates are subject to market conditions as per RBI guidelines.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .pattern-grid {
                    background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
                    background-size: 24px 24px;
                }
                .dark .pattern-grid {
                    background-image: radial-gradient(circle, #1e293b 1px, transparent 1px);
                }
            `}} />
        </div>
    );
};

export default ReceiptTemplateNew;
