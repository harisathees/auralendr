import React from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportCardProps {
    title: string;
    chartData: any[];
    summaryStats?: {
        label: string;
        value: string;
        growth?: string;
        icon?: string;
        iconColor?: string;
        iconBg?: string;
    }[];
    listItems?: {
        label: string;
        value: string;
    }[];
    chartColor?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
    title,
    chartData,
    summaryStats,
    listItems,
    chartColor = "#AA00FF"
}) => {
    return (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">{title}</h2>

            {/* Chart Section */}
            <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        {/* <XAxis dataKey="month" hide /> */}
                        {/* <YAxis hide /> */}
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total_amount"
                            stroke={chartColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#grad-${title.replace(/\s+/g, '')})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats Row */}
            {summaryStats && summaryStats.length > 0 && (
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {summaryStats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${stat.iconBg || 'bg-green-100'}`}>
                                    <span className={`material-symbols-outlined text-[14px] ${stat.iconColor || 'text-green-600'}`}>{stat.icon || 'star'}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</span>
                            </div>
                            {stat.growth && (
                                <span className={`text-[10px] font-black ${stat.growth.startsWith('+') ? 'text-[#00E676]' : 'text-red-500'} mt-1`}>
                                    {stat.growth.startsWith('+') ? '↑' : '↓'} {stat.growth}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* List Items */}
            {listItems && listItems.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                    {listItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group cursor-default">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors capitalize">{item.label}</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportCard;
