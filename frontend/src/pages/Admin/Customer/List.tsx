import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Phone, MapPin, UserX, TrendingUp } from "lucide-react";
import GoldCoinSpinner from "../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import CustomerAnalysisModal from "./CustomerAnalysisModal";

import type { Customer } from "../../../types/models";

const CustomersList: React.FC = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const isFirstSearch = React.useRef(true);
    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchCustomers();
    }, [page]);

    // Debounced Search
    useEffect(() => {
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCustomers = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const newController = new AbortController();
        abortControllerRef.current = newController;

        setLoading(true);
        try {
            const response = await api.get(
                `/customers`,
                {
                    params: { page, search: searchTerm },
                    signal: newController.signal
                }
            );
            setCustomers(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error: any) {
            if (error.name !== 'CanceledError') {
                console.error("Error fetching customers:", error);
            }
        } finally {
            if (!newController.signal.aborted) {
                setLoading(false);
            }
        }
    };


    const [analysisModal, setAnalysisModal] = useState<{ isOpen: boolean; customerId: string | null; customerName: string }>({
        isOpen: false,
        customerId: null,
        customerName: '',
    });

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main">
            {/* Header */}
            <header className="flex-none pt-12 pb-4 px-5 bg-background-light dark:bg-background-dark z-10 sticky top-0">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary-text dark:text-white">Customers</h1>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-secondary-text dark:text-text-muted" />
                    </div>
                    <input
                        className="block w-full p-3 pl-11 text-sm text-primary-text dark:text-white bg-white dark:bg-dark-surface border border-gray-200 dark:border-transparent rounded-xl placeholder-secondary-text dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm outline-none"
                        placeholder="Search by name, mobile, or email..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* List */}
            <main className="flex-1 px-5 pb-24 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <GoldCoinSpinner />
                    </div>
                ) : customers.length > 0 ? (
                    <>
                        <div className="grid gap-3">
                            {customers.map((customer) => (
                                <div key={customer.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-[#1f3d2e] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold shrink-0">
                                            {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                                                {customer.name || 'Unknown'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-secondary-text dark:text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-4 h-4" />
                                                    {customer.mobile_no || 'N/A'}
                                                </div>
                                                {customer.city && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {customer.city}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAnalysisModal({ isOpen: true, customerId: customer.id, customerName: customer.name || '' })}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
                                            title="Analysis"
                                        >
                                            <TrendingUp className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2 pb-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-gray-100 dark:bg-[#1f3d2e] rounded-lg text-sm flex items-center font-medium">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-[#1f3d2e] rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
                        <UserX className="w-12 h-12 mb-2" />
                        <p>No customers found</p>
                    </div>
                )}
            </main>

            <CustomerAnalysisModal
                isOpen={analysisModal.isOpen}
                onClose={() => setAnalysisModal(prev => ({ ...prev, isOpen: false }))}
                customerId={analysisModal.customerId}
                customerName={analysisModal.customerName}
            />
        </div>
    );
};

export default CustomersList;
