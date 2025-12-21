import React, { useEffect } from "react";
import { useRepledge } from "../../hooks/useRepledge";
import { Link, useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

const List: React.FC = () => {
    const { repledgeEntries, fetchRepledgeEntries, loading, deleteRepledgeEntry } = useRepledge();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRepledgeEntries();
    }, [fetchRepledgeEntries]);

    if (loading && repledgeEntries.length === 0) return <GoldCoinSpinner text="Loading Repledges..." />;

    return (
        <div className="flex flex-col h-full bg-[#f7f8fc] dark:bg-gray-900">
            <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text dark:text-white">Repledges</h1>
                    <p className="text-sm text-secondary-text dark:text-gray-400">Manage external re-pledged items</p>
                </div>
                <Link
                    to="/re-pledge/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Repledge
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-4">
                    {repledgeEntries.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-200 dark:hover:border-purple-900 transition-colors group relative cursor-pointer"
                            onClick={() => navigate(`/re-pledge/${item.id}`)}> {/* Making row clickable to view */}

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                                    {item.loan_no.slice(-2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary-text dark:text-white">{item.loan_no}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Re-No: <span className="text-gray-700 dark:text-gray-300">{item.re_no}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 items-center flex-1 md:justify-end">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Bank</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.source?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Amount</span>
                                    <span className="font-bold text-primary-text dark:text-white">₹{Number(item.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions (stop propagation to avoid triggering row click) */}
                            <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 md:relative md:right-0 md:top-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/re-pledge/${item.id}/edit`); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-500"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteRepledgeEntry(item.id); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {repledgeEntries.length === 0 && !loading && (
                        <div className="text-center py-20 text-gray-400">
                            <span className="material-symbols-outlined text-6xl mb-4">move_item</span>
                            <p>No repledges found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default List;
