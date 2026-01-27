import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import GoldCoinSpinner from "../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { CheckCircle, XCircle, AlertCircle, Calendar, ExternalLink, MessageSquare } from "lucide-react";

interface PendingApproval {
    id: string;
    pledge_id: string;
    requested_by: string;
    loan_amount: number;
    estimated_amount: number;
    status: string;
    created_at: string;
    pledge: {
        id: string;
        customer: {
            name: string;
        };
        loan: {
            loan_no: string;
        };
    };
    requested_by_user: {
        name: string;
    };
}

const AdminApprovals: React.FC = () => {
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

    const fetchApprovals = async () => {
        try {
            const res = await api.get("/approvals");
            setApprovals(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch approvals", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleApprove = async (id: string) => {
        if (!window.confirm("Are you sure you want to approve this loan amount?")) return;
        setProcessingId(id);
        try {
            await api.post(`/approvals/${id}/approve`);
            setApprovals(prev => prev.filter(a => a.id !== id));
            alert("Pledge approved and loan activated.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to approve.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        setProcessingId(id);
        try {
            await api.post(`/approvals/${id}/reject`, { rejection_reason: rejectionReason });
            setApprovals(prev => prev.filter(a => a.id !== id));
            setShowRejectModal(null);
            setRejectionReason("");
            alert("Pledge rejected.");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to reject.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading Approvals..." />;

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-primary" />
                        Pledge Approvals
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Review loan requests exceeding estimated values</p>
                </div>
            </div>

            {approvals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Pending Approvals</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">All pledge requests are currently up to date.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {approvals.map((approval) => (
                        <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                            {approval.pledge.customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{approval.pledge.customer.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                    Pledge #{approval.pledge.id.substring(0, 8)}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(approval.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Requested Amount</p>
                                            <p className="text-lg font-black text-rose-600">₹{Number(approval.loan_amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Estimated Max</p>
                                            <p className="text-lg font-black text-emerald-600">₹{Number(approval.estimated_amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Difference</p>
                                            <p className="text-lg font-black text-amber-500">₹{(Number(approval.loan_amount) - Number(approval.estimated_amount)).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Requested By</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{approval.requested_by_user?.name || "Staff"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => window.open(`/admin/pledges/${approval.pledge_id}`, '_blank')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(approval.id)}
                                        disabled={!!processingId}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl text-sm font-black transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(approval.id)}
                                        disabled={!!processingId}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 hover:scale-105"
                                    >
                                        {processingId === approval.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Approve Loan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <MessageSquare className="w-6 h-6" />
                            <h2 className="text-xl font-black">Reason for Rejection</h2>
                        </div>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-gray-700 dark:text-gray-300"
                            placeholder="Why is this loan being rejected?"
                        ></textarea>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectionReason("");
                                }}
                                className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                disabled={!!processingId}
                                className="px-6 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-sm font-black shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApprovals;
