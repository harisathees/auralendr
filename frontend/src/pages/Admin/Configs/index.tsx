import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/Auth/AuthContext";
import { Lock } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminConfigs: React.FC = () => {
    const { user, can } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

    const configGroups = useMemo(() => {
        const groups = [
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
                        title: "Repledge Sources",
                        description: "Manage repledge institutions",
                        icon: "account_balance",
                        color: "text-cyan-600",
                        bg: "bg-cyan-100",
                        link: "/admin/configs/repledge-sources"
                    },
                    {
                        title: "Transaction Categories",
                        description: "Income & Expense categories",
                        icon: "label",
                        color: "text-indigo-600",
                        bg: "bg-indigo-100",
                        link: "/admin/configs/transaction-categories"
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
                    {
                        title: "Pledge Closing",
                        description: "Configure closing calculations",
                        icon: "calculate",
                        color: "text-blue-600",
                        bg: "bg-blue-100",
                        link: "/admin/configs/pledge-closing-calculations"
                    },
                    {
                        title: "Repledge Closing",
                        description: "Repledge closing settings",
                        icon: "functions",
                        color: "text-green-600",
                        bg: "bg-green-100",
                        link: "/admin/configs/repledge-closing-calculations"
                    },
                    {
                        title: "Repledge Fees",
                        description: "Repledge processing fees",
                        icon: "request_quote",
                        color: "text-purple-600",
                        bg: "bg-purple-100",
                        link: "/admin/configs/repledge-processing-fees"
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
                        link: "/admin/configs/branches",
                        permission: 'branch.view'
                    },
                    {
                        title: "Users",
                        description: "Manage system administrators and staff",
                        icon: "people",
                        color: "text-purple-600",
                        bg: "bg-purple-100",
                        link: "/admin/configs/users",
                        permission: 'user.view'
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
                        link: "/admin/configs/roles",
                        permission: 'user_privilege.view'
                    },
                    {
                        title: "Staff Activities",
                        description: "Staff Activities",
                        icon: "people",
                        color: "text-orange-600",
                        bg: "bg-orange-100",
                        link: "/admin/configs/roles",
                        permission: ''
                    },
                ]
            },
            {
                title: "Templates",
                icon: "description",
                description: "Manage message & document templates",
                color: "text-teal-600",
                bg: "bg-teal-100",
                items: [
                    {
                        title: "SMS Templates",
                        description: "Edit SMS notification content",
                        icon: "sms",
                        color: "text-blue-600",
                        bg: "bg-blue-100",
                        link: "/admin/configs/templates/sms"
                    },
                    {
                        title: "WhatsApp Templates",
                        description: "Edit WhatsApp message content",
                        icon: "whatsapp_logo",
                        color: "text-green-600",
                        bg: "bg-green-100",
                        link: "/admin/configs/templates/whatsapp"
                    },
                    {
                        title: "Receipt Templates",
                        description: "Customize payment receipts",
                        icon: "receipt",
                        color: "text-gray-600",
                        bg: "bg-gray-100",
                        link: "/admin/configs/templates/receipt"
                    },
                    {
                        title: "Due Notice",
                        description: "Customize due payment notices",
                        icon: "event_note",
                        color: "text-red-600",
                        bg: "bg-red-100",
                        link: "/admin/configs/templates/due-notice"
                    },
                    {
                        title: "Annual Notice",
                        description: "Customize annual reminders",
                        icon: "calendar_today",
                        color: "text-orange-600",
                        bg: "bg-orange-100",
                        link: "/admin/configs/templates/annual-notice"
                    },
                ]
            }
        ];

        // Filter
        const isDeveloper = user?.role === 'developer';

        return groups.filter(group => {
            if (group.title === "Templates" && !isDeveloper) return false;
            return true;
        }).map(group => ({
            ...group,
            items: group.items.filter(item => {
                if (item.title === "Banks to Repledge" && !isAdmin) return false;

                // Developer Restricted Items
                if ((item.title === "Branches" || item.title === "Brand Kit") && !isDeveloper) return false;

                return true;
            })
        }));
    }, [isAdmin, user?.role]);

    const renderIcon = (iconName: string, colorClass: string) => {
        if (iconName === 'whatsapp_logo') {
            return (
                <svg className={`w-6 h-6 ${colorClass} dark:text-opacity-80 fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            );
        }
        return <span className={`material-symbols-outlined text-xl ${colorClass} dark:text-opacity-80`}>{iconName}</span>;
    };

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
                                {group.items.map((item: any, index) => {
                                    const isAllowed = item.permission ? can(item.permission) : true;

                                    if (!isAllowed) {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => toast.error("Access Denied: Ask your developer to access it")}
                                                className="group/item flex flex-col p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-70 grayscale hover:opacity-100 transition-all ml-4 md:ml-8 relative"
                                            >
                                                {/* Connector Line */}
                                                <div className="absolute -left-4 md:-left-8 top-1/2 w-4 md:w-8 h-px bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>

                                                <div className="flex items-start">
                                                    <div className={`w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 relative`}>
                                                        {renderIcon(item.icon, "text-gray-400")}
                                                        <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                                                            <Lock className="w-3 h-3 text-red-400" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-0.5 flex items-center gap-2">
                                                            {item.title}
                                                            <Lock className="w-3 h-3 text-gray-400" />
                                                        </h4>
                                                        <p className="text-xs text-red-500 font-medium leading-tight mt-1">
                                                            Access Denied: Ask your developer to access it
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            to={item.link}
                                            className="group/item flex flex-col p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-gray-600 transition-all active:scale-[0.98] ml-4 md:ml-8 relative"
                                        >
                                            {/* Connector Line for visual hierarchy */}
                                            <div className="absolute -left-4 md:-left-8 top-1/2 w-4 md:w-8 h-px bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>

                                            <div className="flex items-start">
                                                <div className={`w-10 h-10 rounded-xl ${item.bg} dark:bg-opacity-20 flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform`}>
                                                    {renderIcon(item.icon, item.color)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary-text dark:text-white text-sm mb-0.5">{item.title}</h4>
                                                    <p className="text-xs text-secondary-text dark:text-gray-400 leading-tight">{item.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminConfigs;
