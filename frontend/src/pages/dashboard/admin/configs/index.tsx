import React from "react";
import { Link } from "react-router-dom";

const AdminConfigs: React.FC = () => {


    const configs = [
        {
            title: "Payment Methods",
            description: "Manage cash, bank accounts, and wallets",
            icon: "payments",
            color: "text-green-600",
            bg: "bg-green-100",
            link: "/admin/configs/money-sources"
        },
        {
            title: "Metal Rates",
            description: "Set daily gold and silver rates",
            icon: "currency_rupee",
            color: "text-amber-600",
            bg: "bg-amber-100",
            link: "/admin/configs/metal-rates" // Placeholder link
        },
        {
            title: "Jewel Types",
            description: "Gold, Silver, Platinum...",
            icon: "diamond",
            color: "text-blue-600",
            bg: "bg-blue-100",
            link: "/admin/configs/jewel-types"
        },
        {
            title: "Jewel Qualities",
            description: "22k, 24k, 925...",
            icon: "verified",
            color: "text-purple-600",
            bg: "bg-purple-100",
            link: "/admin/configs/jewel-qualities"
        },
        {
            title: "Jewel Names",
            description: "Ring, Chain, Bangle...",
            icon: "category",
            color: "text-pink-600",
            bg: "bg-pink-100",
            link: "/admin/configs/jewel-names"
        },
        {
            title: "Interest Settings",
            description: "Configure loan interest rates",
            icon: "percent",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
            link: "/admin/configs/interest-settings"
        },
        {
            title: "Validity Months",
            description: "Set loan validity periods",
            icon: "event_repeat",
            color: "text-teal-600",
            bg: "bg-teal-100",
            link: "/admin/configs/validity-periods"
        },
        {
            title: "Loan Processing Fee",
            description: "Manage document charges",
            icon: "post_add",
            color: "text-orange-600",
            bg: "bg-orange-100",
            link: "/admin/configs/processing-fees"
        },
        {
            title: "Banks to Repledge",
            description: "Manage repledge institutions",
            icon: "account_balance",
            color: "text-cyan-600",
            bg: "bg-cyan-100",
            link: "/admin/configs/repledge-banks"
        },
    ];

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-xl font-bold text-primary-text dark:text-white">Configurations</h1>
                    <p className="text-xs text-secondary-text dark:text-gray-400">System settings & master data</p>
                </div>
            </header>

            <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {configs.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link}
                        className="group flex flex-col p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className={`w-12 h-12 rounded-full ${item.bg} dark:bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <span className={`material-symbols-outlined ${item.color} dark:text-opacity-80`}>{item.icon}</span>
                        </div>
                        <h3 className="font-bold text-primary-text dark:text-white mb-1">{item.title}</h3>
                        <p className="text-xs text-secondary-text dark:text-gray-400 leading-relaxed">{item.description}</p>
                    </Link>
                ))}
            </main>
        </div>
    );
};

export default AdminConfigs;
