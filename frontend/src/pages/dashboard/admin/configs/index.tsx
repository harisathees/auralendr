import React from "react";
import { Link } from "react-router-dom";

const AdminConfigs: React.FC = () => {


    const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

    const configGroups = [
        {
            title: "Financials",
            icon: "account_balance_wallet",
            description: "Payment methods, taxes & bank settings",
            color: "text-green-600",
            bg: "bg-green-100",
            items: [
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
                    link: "/admin/configs/metal-rates"
                },
                {
                    title: "Banks to Repledge",
                    description: "Manage repledge institutions",
                    icon: "account_balance",
                    color: "text-cyan-600",
                    bg: "bg-cyan-100",
                    link: "/admin/configs/repledge-banks"
                },
            ]
        },
        {
            title: "Jewel Management",
            icon: "diamond",
            description: "Types, qualities & item names",
            color: "text-blue-600",
            bg: "bg-blue-100",
            items: [
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
            ]
        },
        {
            title: "Loan Configuration",
            icon: "settings_suggest",
            description: "Interest, validity & fees",
            color: "text-purple-600",
            bg: "bg-purple-100",
            items: [
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
            ]
        },
        {
            title: "Organization",
            icon: "domain",
            description: "Manage branches and staff access",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
            items: [
                {
                    title: "Branches",
                    description: "Manage physical store locations",
                    icon: "store",
                    color: "text-indigo-600",
                    bg: "bg-indigo-100",
                    link: "/admin/configs/branches"
                },
                {
                    title: "Users",
                    description: "Manage system administrators and staff",
                    icon: "people",
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                    link: "/admin/configs/users"
                },
                {
                    title: "Brand Kit",
                    description: "Manage logos, colors & themes",
                    icon: "palette",
                    color: "text-rose-600",
                    bg: "bg-rose-100",
                    link: "/admin/configs/brand-kit"
                },
                {
                    title: "User Privileges",
                    description: "Manage role-based access controls",
                    icon: "admin_panel_settings",
                    color: "text-orange-600",
                    bg: "bg-orange-100",
                    link: "/admin/configs/user-privileges"
                },
            ]
        }
    ];

    const toggleGroup = (title: string) => {
        if (expandedGroup === title) {
            setExpandedGroup(null);
        } else {
            setExpandedGroup(title);
        }
    };

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-xl font-bold text-primary-text dark:text-white">Configurations</h1>
                    <p className="text-xs text-secondary-text dark:text-gray-400">System settings & master data</p>
                </div>
            </header>

            <main className="flex-1 p-4">
                <div className="grid grid-cols-1 gap-6">
                    {configGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="flex flex-col">
                            {/* Folder Header / Card */}
                            <div
                                onClick={() => toggleGroup(group.title)}
                                className={`
                                    cursor-pointer group flex items-center p-5 rounded-2xl border transition-all duration-300
                                    ${expandedGroup === group.title
                                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-md'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-100 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                {/* Folder Icon */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-transform duration-300
                                    ${expandedGroup === group.title ? 'scale-110 rotate-3' : 'group-hover:scale-105'}
                                    ${group.bg} dark:bg-opacity-20
                                `}>
                                    <span className={`material-symbols-outlined text-3xl ${group.color} dark:text-opacity-80`}>
                                        {expandedGroup === group.title ? 'folder_open' : 'folder'}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold mb-1 transition-colors ${expandedGroup === group.title ? 'text-blue-700 dark:text-blue-300' : 'text-primary-text dark:text-white'}`}>
                                        {group.title}
                                    </h3>
                                    <p className="text-sm text-secondary-text dark:text-gray-400">
                                        {group.description}
                                    </p>
                                </div>

                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                    ${expandedGroup === group.title ? 'bg-blue-200 text-blue-700 rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}
                                    dark:bg-gray-700 dark:text-gray-400
                                `}>
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>

                            {/* Expanded Content Grid */}
                            <div className={`
                                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ease-in-out overflow-hidden
                                ${expandedGroup === group.title ? 'mt-4 opacity-100 max-h-[1000px]' : 'mt-0 opacity-0 max-h-0'}
                            `}>
                                {group.items.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.link}
                                        className="group/item flex flex-col p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-gray-600 transition-all active:scale-[0.98] ml-4 md:ml-8 relative"
                                    >
                                        {/* Connector Line for visual hierarchy */}
                                        <div className="absolute -left-4 md:-left-8 top-1/2 w-4 md:w-8 h-px bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>

                                        <div className="flex items-start">
                                            <div className={`w-10 h-10 rounded-xl ${item.bg} dark:bg-opacity-20 flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform`}>
                                                <span className={`material-symbols-outlined text-xl ${item.color} dark:text-opacity-80`}>{item.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary-text dark:text-white text-sm mb-0.5">{item.title}</h4>
                                                <p className="text-xs text-secondary-text dark:text-gray-400 leading-tight">{item.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminConfigs;
