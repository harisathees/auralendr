import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/apiClient";
import AddCapitalModal from "./AddCapitalModal";
import WithdrawCapitalModal from "./WithdrawCapitalModal";

const CapitalSourceView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [source, setSource] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    useEffect(() => {
        fetchSource();
    }, [id]);

    const fetchSource = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/capital-sources/${id}`);
            setSource(res.data);
        } catch (err) {
            console.error("Failed to load capital source", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!source) {
        return <div className="p-8 text-center text-gray-500">Source not found</div>;
    }

    return (
        <div className="flex flex-col h-full relative">
            <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-primary-text dark:text-white">{source.name}</h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${source.type === 'owner' ? 'bg-purple-100 text-purple-800' :
                                    source.type === 'investor' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                {source.type.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-xs text-secondary-text dark:text-gray-400">{source.description || "No description provided"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsWithdrawOpen(true)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-all flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                        Withdraw
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-xl text-sm font-bold transition-all flex items-center gap-1 shadow-lg shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Inject Capital
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <span className="text-sm font-bold text-gray-500 uppercase">Net Invested</span>
                        <div className="text-3xl font-black text-primary mt-2">
                            ₹{Number(source.total_invested).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Money Source</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 pr-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {source.transactions && source.transactions.length > 0 ? (
                                    source.transactions.map((tx: any) => (
                                        <tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4 pl-6 text-sm text-gray-900 dark:text-white font-medium">
                                                {new Date(tx.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tx.type === 'credit'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {tx.type === 'credit' ? 'Injection' : 'Withdrawal'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                                {tx.money_source?.name || '-'}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                                {tx.description}
                                            </td>
                                            <td className={`p-4 pr-6 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <AddCapitalModal
                            source={source}
                            onSuccess={() => { setIsAddOpen(false); fetchSource(); }}
                            onCancel={() => setIsAddOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isWithdrawOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <WithdrawCapitalModal
                            source={source}
                            onSuccess={() => { setIsWithdrawOpen(false); fetchSource(); }}
                            onCancel={() => setIsWithdrawOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CapitalSourceView;
