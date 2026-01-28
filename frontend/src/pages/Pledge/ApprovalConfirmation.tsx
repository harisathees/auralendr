import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, RotateCcw, XCircle, Loader2 } from "lucide-react";
import api from "../../api/apiClient";

const ApprovalConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pledgeId = location.state?.pledgeId;
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        if (!pledgeId) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/pledges/${pledgeId}`);
                if (res.data.status === 'active' || res.data.approval_status === 'approved') {
                    setStatus('approved');
                    // Automatically redirect to receipt after a short delay
                    setTimeout(() => {
                        navigate(`/pledges/${pledgeId}/receipt`);
                    }, 1500);
                }
            } catch (error: any) {
                // If 404, it means the pledge was rejected and deleted
                if (error.response && error.response.status === 404) {
                    setStatus('rejected');
                }
            }
        };

        const interval = setInterval(checkStatus, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [pledgeId, navigate]);

    if (status === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Request Rejected</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                        The admin has declined this pledge request.
                    </p>
                    <button
                        onClick={() => navigate('/pledges/create')}
                        className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-base font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                        Create Another
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'approved') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Approved!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                        Redirecting to receipt...
                    </p>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">

                <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-amber-900/20 border-t-amber-500 animate-spin"></div>
                    <Loader2 className="w-10 h-10 text-amber-500 animate-pulse" />
                </div>

                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    Waiting for Approval...
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                    The pledge amount exceeds the estimated value. Please wait while an admin reviews your request.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/pledges')}
                        className="w-full py-3.5 bg-white border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-base font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        Go to Pledges
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-6 text-xs text-gray-400">
                    This page will automatically update once approved.
                </div>
            </div>
        </div>
    );
};

export default ApprovalConfirmation;
