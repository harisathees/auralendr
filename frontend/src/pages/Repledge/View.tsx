import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import GoldCoinSpinner from "../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { useToast } from "../../context";
import { useAuth } from "../../context/Auth/AuthContext";

const View: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { can } = useAuth();
    const [repledge, setRepledge] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/repledges/${id}`);
                setRepledge(res.data);
            } catch (err: any) {
                console.error(err);
                showToast("Failed to fetch repledge details", "error");
                navigate("/repledge");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate, showToast]);

    if (loading) return <GoldCoinSpinner text="Loading Repledge..." />;
    if (!repledge) return null;

    return (
        <div className="flex flex-col h-full bg-[#f7f8fc] dark:bg-gray-900">
            <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/repledge")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-primary-text dark:text-white">Repledge Details</h1>
                        <p className="text-sm text-gray-500">#{repledge.loan_no}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/repledge/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-xl font-bold transition-colors"
                    >
                        <span className="material-symbols-outlined">edit</span>
                        Edit
                    </button>
                    {can('repledge.delete') && (
                        <button
                            onClick={() => {
                                // Assuming delete handled in list or here via hook, keeping simple for now
                                if (confirm("Are you sure?")) {
                                    api.delete(`/repledges/${id}`).then(() => {
                                        showToast("Deleted successfully", "success");
                                        navigate("/repledge");
                                    });
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-xl font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined">delete</span>
                            Delete
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                {!can('repledge.view') ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You don't have permission to view repledge details.</p>
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
                            <p><strong>Debug Info:</strong></p>
                            <p>Check: repledge.view</p>
                            <p>Has Permission: {can('repledge.view') ? 'YES' : 'NO'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        {/* Header Info */}
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-4xl">account_balance</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-primary-text dark:text-white mb-2">{repledge.bank?.name || 'Unknown Bank'}</h2>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                                            {repledge.created_at ? new Date(repledge.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${repledge.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {repledge.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-bold uppercase mb-1">Repledge Amount</p>
                                <p className="text-3xl font-extrabold text-primary-text dark:text-white">₹{Number(repledge.amount).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Loan No</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{repledge.loan_no}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Re-Pledge No</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{repledge.re_no}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Payment Method</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{repledge.payment_method || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Start Date</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                    {repledge.start_date ? repledge.start_date.split('T')[0] : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">End Date</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                    {repledge.end_date ? repledge.end_date.split('T')[0] : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Processing Fee</p>
                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">₹{Number(repledge.processing_fee).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Weights Section */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Gross Wt</p>
                                <p className="font-bold text-xl text-gray-800 dark:text-gray-200">{repledge.gross_weight}g</p>
                            </div>
                            <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Stone Wt</p>
                                <p className="font-bold text-xl text-gray-800 dark:text-gray-200">{repledge.stone_weight}g</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Net Wt</p>
                                <p className="font-bold text-xl text-purple-600 dark:text-purple-400">{repledge.net_weight}g</p>
                            </div>
                        </div>

                        {/* Interest Terms */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Interest %</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{repledge.interest_percent}%</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Validity</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{repledge.validity_period} Months</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Post-Interest %</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{repledge.after_interest_percent}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default View;
