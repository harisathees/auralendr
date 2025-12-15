import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    valueColor?: string;
    icon?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, valueColor = "text-[#1A1D1F] dark:text-white", icon }) => {
    return (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-none relative overflow-hidden group transition-colors duration-300">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10">
                <h3 className="text-gray-500 dark:text-white/60 text-lg font-bold mb-2 transition-colors duration-300">{title}</h3>
                <p className={`text-3xl font-bold ${valueColor} transition-colors duration-300`}>{value}</p>
            </div>

            {icon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-white/10 transition-colors duration-300">{icon}</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
