import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/apiClient"; // Assuming direct API use for customer integration
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from "lucide-react";
import GoldCoinSpinner from "../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

interface Pledge {
    id: string;
    loan_no: string;
    amount: string;
    date: string;
    status: string;
    due_date: string;
    closed_date?: string;
    // Add other fields as necessary
}

const CustomerLoans: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loans, setLoans] = useState<Pledge[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState("");

    useEffect(() => {
        if (id) fetchCustomerLoans();
    }, [id]);

    const fetchCustomerLoans = async () => {
        setLoading(true);
        try {
            // Fetch Customer Details for Name
            const customerRes = await api.get(`/customers/${id}`);
            setCustomerName(customerRes.data.name);

            // Fetch Loans - Assuming an endpoint or filtering existing pledges
            // Adjust this endpoint based on actual backend API
            const response = await api.get(`/pledges`, {
                params: { customer_id: id, per_page: 100 }
            });
            setLoans(response.data.data);
        } catch (error) {
            console.error("Error fetching customer loans:", error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display">
            {/* Header */}
            <header className="flex-none pt-8 pb-4 px-5 bg-background-light dark:bg-background-dark z-10 sticky top-0">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan History</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">for {customerName || 'Customer'}</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 pb-10 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <GoldCoinSpinner />
                    </div>
                ) : loans.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {loans.map((loan) => (
                            <div
                                key={loan.id}
                                onClick={() => navigate(`/admin/pledges/${loan.id}`)}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                                    ${loan.status === 'closed'
                                        ? 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:shadow-md dark:bg-white/5 dark:border-white/5 dark:text-gray-400'
                                        : loan.status === 'overdue'
                                            ? 'bg-red-50/50 border-red-100 text-red-700 hover:bg-red-50 hover:shadow-md hover:shadow-red-500/10 dark:bg-red-900/10 dark:border-red-900/30'
                                            : 'bg-white border-gray-100 text-gray-900 hover:shadow-md hover:border-indigo-100 dark:bg-dark-surface dark:border-white/5 dark:text-white'
                                    }`}
                            >
                                <div className={`p-4 rounded-full mb-3 transform group-hover:scale-110 transition-transform duration-300
                                    ${loan.status === 'closed'
                                        ? 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
                                        : loan.status === 'overdue'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    }`}>
                                    <FileText className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-lg tracking-tight mb-1">{loan.loan_no}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${loan.status === 'closed' ? 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400' :
                                    loan.status === 'overdue' ? 'bg-red-200/50 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                        'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    }`}>
                                    ₹{Number(loan.amount).toLocaleString()}
                                </span>

                                {/* Status Indicator */}
                                {loan.status === 'overdue' && (
                                    <div className="absolute top-3 right-3">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                                {loan.status === 'closed' && (
                                    <div className="absolute top-3 right-3">
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FileText className="w-12 h-12 mb-3 opacity-50" />
                        <p>No existing loans found for this customer.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerLoans;
