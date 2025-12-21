
import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const response = await api.get("/metal-rates");
            setRates(response.data);
        } catch (error) {
            console.error("Failed to fetch rates:", error);
        } finally {
            setLoading(false);
        }
    };

    const goldItem = rates.find(r => r.name.toLowerCase().includes('gold'));
    const silverItem = rates.find(r => r.name.toLowerCase().includes('silver'));

    const goldRate = goldItem?.metal_rate?.rate;
    const silverRate = silverItem?.metal_rate?.rate;
    const goldPrev = goldItem?.metal_rate?.previous_rate;
    const silverPrev = silverItem?.metal_rate?.previous_rate;

    const renderTrendIcon = (current?: string, previous?: string) => {
        if (!current || !previous) return null;
        const currVal = parseFloat(current);
        const prevVal = parseFloat(previous);

        if (currVal > prevVal) {
            return (
                <div className="w-8 h-8 rounded-full border border-[#FFCA28] flex items-center justify-center text-[#FFCA28] bg-[#FFCA28]/10">
                    <span className="material-symbols-outlined font-bold text-lg">arrow_upward</span>
                </div>
            );
        } else if (currVal < prevVal) {
            return (
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/60 bg-white/5">
                    <span className="material-symbols-outlined font-bold text-lg">arrow_downward</span>
                </div>
            );
        }
        return null;
    };

    // Date formatting
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-full relative rounded-[2rem] overflow-hidden shadow-2xl min-h-[360px]">
            {/* Background - Brown Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#2D1B18]" />

            {/* Decorative Circles/Glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FDB931] opacity-5 blur-[100px] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#8D6E63] opacity-10 blur-[80px] rounded-full" />

            {/* Content Container */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">

                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        {/* Icon/Logo Placeholder */}
                        <div className="w-12 h-12 rounded-full border border-[#FDB931] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#FDB931] text-2xl">diamond</span>
                        </div>

                        <div className="text-white text-left">
                            <p className="font-medium text-sm text-white/80 tracking-wide">{dateStr}</p>
                            <p className="text-xs text-white/50">{timeStr}</p>

                            <h1 className="text-5xl font-serif font-bold text-[#FDB931] mt-3 tracking-wide">
                                AuraLendr
                            </h1>
                            <p className="text-white/60 text-lg font-light tracking-wider">
                                Pawn & Finance Co.
                            </p>
                        </div>
                    </div>

                    {/* Image Mockup on Right */}
                    <div className="absolute right-0 top-12 w-48 h-40 transform rotate-6 shadow-xl border-4 border-white/5 bg-black/50 overflow-hidden rounded-lg backdrop-blur-sm hidden md:block">
                        {/* Placeholder for Jewelry Image */}
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/20 text-6xl">diamond</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#3E2723]/90 text-white/70 text-[10px] py-1 px-2 text-center uppercase tracking-widest font-bold">
                            Global Metal Prices
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-white/30 text-2xl md:hidden">share</span>

                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

                {/* Rates Section */}
                <div className="space-y-6">
                    {/* Gold */}
                    <div>
                        <p className="text-[#FDB931] text-xs font-bold uppercase tracking-widest mb-1">GOLD PRICE (22K)</p>
                        <div className="flex items-center gap-4">
                            <h2 className="text-4xl font-bold text-white">
                                ₹{goldRate ? parseFloat(goldRate).toLocaleString() : "---"}
                                <span className="text-lg font-normal text-white/50 ml-2">/ 1gm</span>
                            </h2>
                            {renderTrendIcon(goldRate, goldPrev)}
                        </div>
                    </div>

                    {/* Silver */}
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">SILVER PRICE</p>
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-bold text-white">
                                    ₹{silverRate ? parseFloat(silverRate).toLocaleString() : "---"}
                                    <span className="text-lg font-normal text-white/50 ml-2">/ 1gm</span>
                                </h2>
                                {renderTrendIcon(silverRate, silverPrev)}
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-white/30 text-xs font-medium">Place: Chennai, India</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetalRatesCard;
