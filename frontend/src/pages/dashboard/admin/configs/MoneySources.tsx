import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { MoneySource } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import MoneySourceForm from "./MoneySourceForm";
import ConfirmationModal from "../../../../components/Shared/ConfirmationModal";
import { useToast } from "../../../../context/ToastContext";

const MoneySources: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sources, setSources] = useState<MoneySource[]>([]);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<MoneySource | null>(null);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const res = await http.get("/money-sources");
            setSources(res.data);
        } catch (err) {
            console.error("Failed to fetch sources", err);
            // showToast("Failed to load payment methods", "error"); // Optional: Don't spam toasts on load
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        try {
            await http.delete(`/money-sources/${deletingId}`);
            setSources(sources.filter((s) => s.id !== deletingId));
            setIsDeleteOpen(false);
            setDeletingId(null);
            showToast("Payment method deleted successfully", "success");
        } catch (err) {
            console.error("Failed to delete source", err);
            showToast("Failed to delete payment method", "error");
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingSource(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (source: MoneySource) => {
        setEditingSource(source);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingSource(null);
        fetchSources(); // Refresh list
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <button
                    onClick={() => navigate('/admin/configs')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-secondary-text dark:text-white">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">payments</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary-text dark:text-white">Payment Methods</h1>
                        <p className="text-xs text-secondary-text dark:text-gray-400">Manage cash & bank accounts</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="p-2 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors shadow-lg flex items-center gap-2 px-4"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="text-sm font-bold">Add New</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {/* Grid Section */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                        {sources.map((source) => (
                            <div key={source.id} className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100 dark:border-gray-800">
                                {/* Visual Header */}
                                <div className="relative h-40 flex items-center justify-center bg-green-50 dark:bg-green-900/20">

                                    {/* Large Icon */}
                                    <span className="material-symbols-outlined text-[5rem] drop-shadow-sm transition-transform group-hover:scale-110 duration-500 text-green-200 dark:text-green-500/30">
                                        {source.type === 'cash' ? 'payments' : source.type === 'bank' ? 'account_balance' : 'account_balance_wallet'}
                                    </span>

                                    {/* Balance - Top Right */}
                                    <div className="absolute top-4 right-5 flex flex-col items-end">
                                        <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-green-700/60 dark:text-green-300/60">
                                            Balance
                                        </span>
                                        <span className="text-3xl font-black font-display tracking-tight text-primary dark:text-green-400">
                                            ₹{parseFloat(source.balance).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Edit/Delete Actions - Floating Top Left */}
                                    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(source); }}
                                            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm flex items-center justify-center text-primary hover:text-green-700 hover:scale-110 transition-all backdrop-blur-sm"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(source.id); }}
                                            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm flex items-center justify-center text-red-500 hover:text-red-700 hover:scale-110 transition-all backdrop-blur-sm"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-5 flex flex-col flex-1 bg-white dark:bg-gray-900 relative">
                                    {/* Curve Divider Effect */}
                                    <div className="absolute -top-6 left-0 right-0 h-6 bg-white dark:bg-gray-900 rounded-t-[2rem]"></div>

                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-primary-text dark:text-white leading-tight line-clamp-1" title={source.name}>{source.name}</h3>
                                    </div>

                                    {/* Metadata Row */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                            <span className="text-xs font-medium text-secondary-text dark:text-gray-400">{source.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        {!source.show_balance && (
                                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[12px]">visibility_off</span> Hidden
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-3">
                                        {source.is_outbound && (
                                            <div className="flex items-center gap-1.5" title="Can Send Money">
                                                <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900 border border-green-100 dark:border-green-800 flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-400 font-bold">arrow_upward</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Send</span>
                                            </div>
                                        )}
                                        {source.is_inbound && (
                                            <div className="flex items-center gap-1.5" title="Can Receive Money">
                                                <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900 border border-green-100 dark:border-green-800 flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-400 font-bold">arrow_downward</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Receive</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sources.length === 0 && (
                            <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">payments</span>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No payment methods configured yet.</p>
                                <button onClick={handleOpenCreate} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
                                    Add your first method
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <MoneySourceForm
                            initialData={editingSource}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Payment Method?"
                message="Are you sure you want to delete this payment method? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteOpen(false)}
                confirmText="Delete Method"
                isDanger={true}
            />
        </div>
    );
};

export default MoneySources;
