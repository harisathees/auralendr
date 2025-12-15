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

                {/* List Section */}
                <section>
                    <div className="grid grid-cols-1 gap-4">
                        {sources.map((source) => (
                            <div key={source.id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-2 hover:border-primary/30 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${source.type === 'cash' ? 'bg-orange-100 text-orange-600' :
                                            source.type === 'bank' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            <span className="material-symbols-outlined">
                                                {source.type === 'cash' ? 'payments' : source.type === 'bank' ? 'account_balance' : 'account_balance_wallet'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary-text dark:text-white">{source.name}</h3>
                                            <span className="text-xs uppercase tracking-wider text-secondary-text dark:text-gray-500 font-bold">{source.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white font-mono tracking-tight mb-1">
                                            ₹{parseFloat(source.balance).toLocaleString()}
                                        </span>

                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1 ${source.is_active ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {source.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            {!source.show_balance && (
                                                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" title="Balance hidden from public">
                                                    <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {source.description && (
                                    <p className="text-sm text-secondary-text dark:text-gray-400">{source.description}</p>
                                )}

                                <div className="flex flex-wrap gap-2 mt-1">
                                    {source.is_outbound && (
                                        <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">arrow_upward</span> SEND
                                        </span>
                                    )}
                                    {source.is_inbound && (
                                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">arrow_downward</span> RECEIVE
                                        </span>
                                    )}
                                </div>

                                {source.branches && source.branches.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {source.branches.map(b => (
                                            <span key={b.id} className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                {b.branch_name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEdit(source)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(source.id)}
                                        className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {sources.length === 0 && (
                            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">payments</span>
                                <p className="text-secondary-text dark:text-gray-400">No payment methods configured.</p>
                                <button onClick={handleOpenCreate} className="text-primary font-bold text-sm mt-2 hover:underline">Add First Method</button>
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
