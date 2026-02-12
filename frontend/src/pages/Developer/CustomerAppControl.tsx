import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/Auth/AuthContext";
import { Store } from "lucide-react";

const CustomerAppControl: React.FC = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(""); // Default empty string = Global/All
    const [customerAppEnabled, setCustomerAppEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get("/branches");
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setBranches(data);
            } catch (error) {
                console.error("Failed to fetch branches");
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                let url = `/developer/settings`;
                // If empty string, send null parameter for global
                if (selectedBranchId !== "") {
                    url += `?branch_id=${selectedBranchId}`;
                } else {
                    url += `?branch_id=null`;
                }
                const res = await api.get(url);
                setCustomerAppEnabled(!!res.data.enable_customer_app);
                setEnableTransactions(!!res.data.enable_transactions);
                setEnableTasks(!!res.data.enable_tasks);
                setEnableReceiptPrint(!!res.data.enable_receipt_print);
                setEnableEstimatedAmount(!!res.data.enable_estimated_amount);
                setEnableBankPledge(res.data.enable_bank_pledge !== undefined ? !!res.data.enable_bank_pledge : false);
                setNoBranchMode(res.data.no_branch_mode !== undefined ? !!res.data.no_branch_mode : false);
                setEnableApprovals(res.data.enable_approvals !== undefined ? !!res.data.enable_approvals : false);
            } catch (error) {
                console.error("Failed to fetch settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [selectedBranchId]);

    const handleToggle = async (newValue: boolean) => {
        // Optimistic update
        setCustomerAppEnabled(newValue);

        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_customer_app: newValue
            };

            await api.post('/developer/settings', payload);
            toast.success(`Customer App ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setCustomerAppEnabled(!newValue); // Revert
            toast.error("Failed to update setting");
        }
    };

    const [enableTransactions, setEnableTransactions] = useState(false);

    const handleTransactionToggle = async (newValue: boolean) => {
        setEnableTransactions(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_transactions: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Transactions ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableTransactions(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [enableTasks, setEnableTasks] = useState(false);

    const handleTaskToggle = async (newValue: boolean) => {
        setEnableTasks(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_tasks: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Tasks ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableTasks(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [enableReceiptPrint, setEnableReceiptPrint] = useState(false);

    const handleReceiptPrintToggle = async (newValue: boolean) => {
        setEnableReceiptPrint(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_receipt_print: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Receipt Printing ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableReceiptPrint(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [enableEstimatedAmount, setEnableEstimatedAmount] = useState(false);

    const handleEstimatedAmountToggle = async (newValue: boolean) => {
        setEnableEstimatedAmount(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_estimated_amount: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Estimated Amount ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableEstimatedAmount(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [enableBankPledge, setEnableBankPledge] = useState(false);

    const handleBankPledgeToggle = async (newValue: boolean) => {
        setEnableBankPledge(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_bank_pledge: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Bank Pledge ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableBankPledge(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [noBranchMode, setNoBranchMode] = useState(false);

    const handleNoBranchModeToggle = async (newValue: boolean) => {
        setNoBranchMode(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                no_branch_mode: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`No Branch Mode ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setNoBranchMode(!newValue);
            toast.error("Failed to update setting");
        }
    };

    const [enableApprovals, setEnableApprovals] = useState(false);

    const handleApprovalsToggle = async (newValue: boolean) => {
        setEnableApprovals(newValue);
        try {
            const payload = {
                branch_id: selectedBranchId === "" ? null : selectedBranchId,
                enable_approvals: newValue
            };
            await api.post('/developer/settings', payload);
            toast.success(`Approvals ${newValue ? 'Enabled' : 'Disabled'}`);
        } catch (err) {
            setEnableApprovals(!newValue);
            toast.error("Failed to update setting");
        }
    };

    if (user?.role !== 'developer') {
        return <div className="p-6 text-red-500">Access Denied</div>;
    }

    return (
        <div className="p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white font-display">
                        Customer App Control
                    </h1>
                    <p className="text-sm text-secondary-text dark:text-gray-400">
                        Manage public access to the customer tracking app.
                    </p>
                </div>
            </div>

            <div className="mb-6 w-full max-w-md">
                <label className="text-xs font-bold text-gray-500 mb-2 block">Configuration Scope</label>
                <select
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                    <option value="">All Branches (Global)</option>
                    {branches.map((branch: any) => (
                        <option key={branch.id} value={String(branch.id)}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                    {selectedBranchId !== ""
                        ? "Configuring setting for a specific branch."
                        : "Configuring setting for ALL branches unless overridden."}
                </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-100 dark:border-slate-700 transition-all max-w-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Customer Tracking App</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                When enabled, QR codes will print on receipts and the tracking URL will be active.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={customerAppEnabled}
                            onChange={(e) => handleToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>


            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Organization Transactions</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                When disabled, payment methods are hidden and no financial records are created.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableTransactions}
                            onChange={(e) => handleTransactionToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-purple-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-slate-700 rounded-xl text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Task Feature</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable or disable task management features for the organization.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableTasks}
                            onChange={(e) => handleTaskToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-orange-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-slate-700 rounded-xl text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined">print</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Receipt Printing</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable or disable automatic receipt printing and viewing.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableReceiptPrint}
                            onChange={(e) => handleReceiptPrintToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                    </label>
                </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-cyan-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-100 dark:bg-slate-700 rounded-xl text-cyan-600 dark:text-cyan-400">
                            <span className="material-symbols-outlined">calculate</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Estimated Amount</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable or disable estimated amount calculations and inputs.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableEstimatedAmount}
                            onChange={(e) => handleEstimatedAmountToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <span className="material-symbols-outlined">autorenew</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bank Pledge</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable or disable the "Create Bank Pledge" button in staff navigation.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableBankPledge}
                            onChange={(e) => handleBankPledgeToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-red-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-slate-700 rounded-xl text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined">business_center</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Branch Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable to allow pledge creation on admin dashboard without branch restrictions.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={noBranchMode}
                            onChange={(e) => handleNoBranchModeToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-pink-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-pink-100 dark:border-slate-700 transition-all max-w-2xl mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-slate-700 rounded-xl text-pink-600 dark:text-pink-400">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Approvals System</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable or disable the approval workflow for pledges exceeding limits.
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enableApprovals}
                            onChange={(e) => handleApprovalsToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                </div>
            </div>
        </div >
    );
};

export default CustomerAppControl;
