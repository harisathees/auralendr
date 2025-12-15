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
        e.stopPropagation(); // Prevent card collapse/expand
        if (cardRef.current) {
            try {
                // Ensure the card is fully rendered before capturing
                const dataUrl = await htmlToImage.toPng(cardRef.current, {
                    quality: 1.0,
                    pixelRatio: 2, // Improve image quality
                    backgroundColor: 'transparent',
                    style: {
                        height: 'auto', // Capture full height
                        minHeight: '320px'
                    }
                });

                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "todays-rates.png", { type: "image/png" });

                if (navigator.share) {
                    await navigator.share({
                        files: [file],
                        title: "Today's Gold Rates",
                        text: "Check out today's gold rates at AuraLendr!",
                    });
                } else {
                    // Fallback for desktop: download the image
                    const link = document.createElement('a');
                    link.download = 'todays-rates.png';
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

    // Helper to determine trend
    const renderTrend = (rateStr?: string, prevRateStr?: string) => {
        if (!rateStr || !prevRateStr) return null;

        const rate = parseFloat(rateStr);
        const prevRate = parseFloat(prevRateStr);

        if (rate > prevRate) {
            return (
                <div className="ml-2 w-8 h-8 rounded-full border border-[#FFCA28] flex items-center justify-center text-[#FFCA28]">
                    <span className="material-symbols-outlined font-bold">arrow_upward</span>
                </div>
            );
        } else if (rate < prevRate) {
            return (
                <div className="ml-2 w-8 h-8 rounded-full border border-red-400 flex items-center justify-center text-red-400">
                    <span className="material-symbols-outlined font-bold">arrow_downward</span>
                </div>
            );
        }
        return (
            <div className="ml-2 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/50">
                <span className="material-symbols-outlined font-bold">remove</span>
            </div>
        );
    };

    const goldRate = goldItem?.metal_rate?.rate;
    const silverRate = silverItem?.metal_rate?.rate;

    // Prefer the updated_at from the rate itself, fallback to today
    const lastUpdated = goldItem?.metal_rate?.updated_at || new Date().toISOString();


    return (
        <div
            ref={cardRef}
            className="w-full relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url("C:/Users/HII/.gemini/antigravity/brain/f3999395-50d7-494e-9883-eb9b991d56d8/premium_dark_gold_bg_1765712506193.png")`, // Use new premium background
                    filter: "brightness(0.5)"
                }}
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />

            {/* Content Container - Flex Column Logic */}
            <div className={`relative z-10 p-6 flex flex-col transition-all duration-500 ease-in-out ${isExpanded ? 'h-auto min-h-[320px]' : 'h-20'}`}>

                {/* Collapsed Header Logic */}
                {!isExpanded && (
                    <div className="flex items-center justify-between h-full w-full">
                        {/* Left: Title & Date (Compact) */}
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FDB931] to-[#9f7928] flex items-center justify-center shadow-lg transform -rotate-12 border border-white/20">
                                <span className="text-xl">✨</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">Today's Rates</h3>
                                <p className="text-white/60 text-xs">
                                    {new Date(lastUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>

                        {/* Right: Compact Rates Preview */}
                        <div className="flex items-center gap-6">
                            {/* Gold Compact */}
                            <div className="flex flex-col items-end">
                                <span className="text-[#FFCA28] text-xs font-bold uppercase tracking-wider">Gold</span>
                                <span className="text-white font-bold">₹{goldRate ? parseFloat(goldRate).toLocaleString() : "---"}</span>
                            </div>
                            {/* Silver Compact */}
                            <div className="flex flex-col items-end hidden md:flex"> {/* Visible on md+ */}
                                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Silver</span>
                                <span className="text-white font-bold">₹{silverRate ? parseFloat(silverRate).toLocaleString() : "---"}</span>
                            </div>
                            {/* Silver Mobile Only (Added strictly as per request) */}
                            <div className="flex flex-col items-end md:hidden">
                                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Ag</span>
                                <span className="text-white font-bold">₹{silverRate ? parseFloat(silverRate).toLocaleString() : "---"}</span>
                            </div>

                            {/* Expand Icon */}
                            <span className="material-symbols-outlined text-white/50">expand_more</span>
                        </div>
                    </div>
                )}

                {/* Expanded Content */}
                <div className={`transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FDB931] to-[#9f7928] flex items-center justify-center shadow-lg transform -rotate-12 border border-white/20">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white tracking-wide">
                                    Today's Rates
                                </h3>
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    {new Date(lastUpdated).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleShare}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full transition-colors text-white border border-white/10 group relative"
                            title="Share as Image"
                        >
                            <span className="material-symbols-outlined">share</span>
                            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Share Card
                            </span>
                        </button>
                    </div>

                    {/* Rates Grid */}
                    <div className="space-y-6 mt-4">
                        {/* Gold Rate */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-[#FFCA28]/20 flex items-center justify-center border border-[#FFCA28]/30 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-2xl">👑</span>
                                </div>
                                <div>
                                    <p className="text-[#FFCA28] font-bold text-sm tracking-widest uppercase mb-0.5">Gold Rate</p>
                                    <p className="text-white/40 text-xs">22k / 916 Hallmarked</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl md:text-4xl font-bold text-white">
                                    ₹{goldRate ? parseFloat(goldRate).toLocaleString() : "---,---"}
                                </span>
                                <span className="text-white/60 text-sm">/ 1gm</span>
                                {renderTrend(goldItem?.metal_rate?.rate, goldItem?.metal_rate?.previous_rate)}
                            </div>
                        </div>

                        {/* Silver Rate */}
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-400/20 flex items-center justify-center border border-gray-400/30 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-2xl">⚪</span>
                                </div>
                                <div>
                                    <p className="text-gray-300 font-bold text-sm tracking-widest uppercase mb-0.5">Silver Rate</p>
                                    <p className="text-white/40 text-xs">99.9% Pure Silver</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl md:text-4xl font-bold text-white">
                                    ₹{silverRate ? parseFloat(silverRate).toLocaleString() : "--,---"}
                                </span>
                                <span className="text-white/60 text-sm">/ 1gm</span>
                                {renderTrend(silverItem?.metal_rate?.rate, silverItem?.metal_rate?.previous_rate)}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="md:ml-auto mt-4 md:mt-0 text-white/50 text-sm font-medium text-right">
                            Place: Chennai, India
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetalRatesCard;
