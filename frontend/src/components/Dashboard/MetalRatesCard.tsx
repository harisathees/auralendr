import React, { useState, useRef, useEffect } from "react";
import http from "../../api/http";
import * as htmlToImage from 'html-to-image';

interface MetalRate {
    rate: string;
    updated_at: string;
    previous_rate?: string;
}

interface JewelType {
    name: string;
    metal_rate?: MetalRate;
}

const MetalRatesCard: React.FC = () => {
    const [rates, setRates] = useState<JewelType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const response = await http.get("/metal-rates");
            setRates(response.data);
        } catch (error) {
            console.error("Failed to fetch rates:", error);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cardRef.current) {
            try {
                const dataUrl = await htmlToImage.toPng(cardRef.current, {
                    quality: 1.0,
                    pixelRatio: 3,
                    backgroundColor: 'transparent',
                });

                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "auralendr-rates.png", { type: "image/png" });

                if (navigator.share) {
                    await navigator.share({
                        files: [file],
                        title: "AuraLendr Metal Rates",
                        text: "Check out today's gold rates at AuraLendr!",
                    });
                } else {
                    const link = document.createElement('a');
                    link.download = 'auralendr-rates.png';
                    link.href = dataUrl;
                    link.click();
                }
            } catch (error) {
                console.error("Error sharing:", error);
            }
        }
    };

    const goldItem = rates.find(r => r.name.toLowerCase().includes('gold'));
    const silverItem = rates.find(r => r.name.toLowerCase().includes('silver'));

    const renderTrend = (rateStr?: string, prevRateStr?: string) => {
        const rate = rateStr ? parseFloat(rateStr) : 0;
        const prevRate = prevRateStr ? parseFloat(prevRateStr) : 0;

        if (rate > prevRate) {
            return (
                <div className="w-8 h-8 rounded-full border border-[#FFCA28] flex items-center justify-center text-[#FFCA28]">
                    <span className="material-symbols-outlined font-bold text-lg">arrow_upward</span>
                </div>
            );
        } else if (rate < prevRate) {
            return (
                <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined font-bold text-lg">arrow_downward</span>
                </div>
            );
        }
        return (
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/50">
                <span className="material-symbols-outlined font-bold text-lg">remove</span>
            </div>
        );
    };

    const goldRate = goldItem?.metal_rate?.rate;
    const silverRate = silverItem?.metal_rate?.rate;
    const lastUpdated = goldItem?.metal_rate?.updated_at ? new Date(goldItem.metal_rate.updated_at) : new Date();

    return (
        <div
            ref={cardRef}
            className="w-full relative rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-[1.01] duration-300"
            style={{
                background: 'linear-gradient(135deg, #2C1A14 0%, #4A2F25 50%, #20130F 100%)'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Background Texture/Noise could be added here if desired */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>

            {/* Decorative circles */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-64 h-64 rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full border border-white/5 pointer-events-none"></div>

            <div className="relative z-10 p-6 md:p-8 text-white font-sans min-h-[350px] flex flex-col justify-between">

                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#FFCA28] text-2xl">diamond</span>
                        </div>
                        <div>
                            <div className="text-white/90 font-medium text-lg leading-none">
                                {lastUpdated.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                            </div>
                            <div className="text-white/60 text-sm mt-1">
                                {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white/70">share</span>
                    </button>
                </div>

                {/* Brand Name */}
                <div className="mt-8 mb-4">
                    <h1 className="text-[#FFCA28] text-4xl font-serif tracking-wide drop-shadow-lg">
                        AuraLendr
                    </h1>
                    <p className="text-white/60 text-lg font-light tracking-wide">
                        Pawn & Finance Co.
                    </p>
                </div>

                {/* Decorative Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

                {/* Jewelry Image Overlay */}
                <div className="absolute top-16 right-[-20px] w-48 h-48 md:w-64 md:h-64 object-contain opacity-90 transform rotate-12 drop-shadow-2xl grayscale-[0.2] contrast-125 pointer-events-none">
                    <img
                        src="C:/Users/HII/.gemini/antigravity/brain/f3999395-50d7-494e-9883-eb9b991d56d8/jewelry_overlay.webp"
                        alt="Luxury Jewelry"
                        className="w-full h-full object-contain rounded-xl shadow-xl"
                        style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                    />
                    {/* Badge */}
                    <div className="absolute bottom-4 -left-4 bg-[#3E2723] text-white/80 text-[10px] uppercase tracking-[0.2em] px-3 py-1 shadow-lg">
                        Global Metal Prices
                    </div>
                </div>

                {/* Prices Section */}
                <div className="mt-auto space-y-6 relative z-20">

                    {/* Gold */}
                    <div>
                        <div className="text-[#FFCA28] text-sm font-bold uppercase tracking-widest mb-1">
                            Gold Price (22k)
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold text-white tracking-tight drop-shadow-md">
                                ₹{goldRate ? parseFloat(goldRate).toLocaleString() : "---"}
                                <span className="text-lg text-white/50 font-normal ml-2">/ 1gm</span>
                            </div>
                            {renderTrend(goldItem?.metal_rate?.rate, goldItem?.metal_rate?.previous_rate)}
                        </div>
                    </div>

                    {/* Silver */}
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">
                                Silver Price
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-3xl font-bold text-white tracking-tight">
                                    ₹{silverRate ? parseFloat(silverRate).toLocaleString() : "---"}
                                    <span className="text-sm text-white/50 font-normal ml-1">/ 1gm</span>
                                </div>
                                {renderTrend(silverItem?.metal_rate?.rate, silverItem?.metal_rate?.previous_rate)}
                            </div>
                        </div>

                        <div className="text-white/40 text-xs font-medium tracking-wide">
                            Place: Chennai, India
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetalRatesCard;
