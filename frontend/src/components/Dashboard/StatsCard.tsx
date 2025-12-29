import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
    title: string;
    value: string;
    valueColor?: string;
    growth?: string;
    description?: string;
    trendData?: { value: number }[];
    trendColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    valueColor = "text-gray-900 dark:text-white",
    growth,
    description,
    trendData = [
        { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 18 }, { value: 14 }, { value: 20 }
    ],
    trendColor = "#00E676"
}) => {
    return (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group h-32">
            <div className="flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-gray-400 dark:text-gray-500 text-sm font-bold mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-black ${valueColor} tracking-tight`}>{value}</p>
                        {growth && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${growth.startsWith('+') ? 'text-[#00E676] bg-[#00E676]/10' : 'text-red-500 bg-red-500/10'}`}>
                                {growth}
                            </span>
                        )}
                    </div>
                </div>
                {description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{description}</p>
                )}
            </div>

            <div className="w-32 h-16 opacity-80 group-hover:opacity-100 transition-opacity translate-y-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={trendColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#grad-${title.replace(/\s+/g, '')})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsCard;
