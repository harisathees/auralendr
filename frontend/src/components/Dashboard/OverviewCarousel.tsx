import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, PieChart, Gem } from 'lucide-react';

interface OverviewStats {
    assets_value: number;
    customers: number;
    net_profit: number;
    gross_profit: number;
    total_portfolio: number;
}

interface CardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    bg: string;
    text: string;
    desc: string;
    isCount?: boolean;
    link?: string;
}

interface Props {
    stats: OverviewStats;
    loading?: boolean;
}

const OverviewCarousel: React.FC<Props> = ({ stats, loading }) => {
    const navigate = useNavigate();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            notation: 'compact',
        }).format(val || 0);
    };

    const cards: CardProps[] = [
        {
            title: 'Current Portfolio',
            value: stats.total_portfolio,
            icon: <PieChart className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600',
            desc: 'Active Principal',
            link: '/reports/verification/business-overview?type=portfolio'
        },
        {
            title: 'Assets Value',
            value: stats.assets_value,
            icon: <Gem className="w-5 h-5 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            text: 'text-amber-600',
            desc: 'Gold & Silver',
            link: '/reports/verification/business-overview?type=assets'
        },
        {
            title: 'Net Profit',
            value: stats.net_profit, // Realized Interest - Manual Expenses
            icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-600',
            desc: 'Realized - Expenses',
            link: '/reports/verification/business-overview?type=net_profit'
        },
        {
            title: 'Gross Profit',
            value: stats.gross_profit, // Realized Interest (Cash)
            icon: <DollarSign className="w-5 h-5 text-cyan-600" />,
            bg: 'bg-cyan-50 dark:bg-cyan-900/20',
            text: 'text-cyan-600',
            desc: 'Interest Collected',
            link: '/reports/verification/business-overview?type=gross_profit'
        },
        {
            title: 'Total Customers',
            value: stats.customers,
            icon: <Users className="w-5 h-5 text-violet-600" />,
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            text: 'text-violet-600',
            desc: 'Active Base',
            isCount: true,
            link: '/reports/verification/business-overview?type=customers'
        },
    ];

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[200px] h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse shrink-0" />
                ))}
            </div>
        );
    }

    return (
        <div className="relative -mx-4 md:mx-0">
            <div className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-0 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (card.link) {
                                console.log('Navigating to:', card.link);
                                navigate(card.link);
                            }
                        }}
                        className={`min-w-[180px] md:min-w-[220px] bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm snap-start shrink-0 flex flex-col justify-between h-28 hover:shadow-md transition-shadow ${card.link ? 'cursor-pointer' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-xl ${card.bg}`}>
                                {card.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {card.desc}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide">
                                {card.title}
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {card.isCount ? card.value : formatCurrency(card.value)}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewCarousel;
