import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminConfigs: React.FC = () => {
    const navigate = useNavigate();

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
        // Add more configs here as needed like Jewel Types etc.
    ];

    return (
        <div className="flex flex-col h-full">
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
