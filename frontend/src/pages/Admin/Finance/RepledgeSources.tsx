import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import type { RepledgeSource } from "../../../types/models";
import { useNavigate } from "react-router-dom";
import RepledgeSourceForm from "./RepledgeSourceForm";
import ConfirmationModal from "../../../components/Shared/ConfirmationModal";
import { useToast } from "../../../context/Toast/ToastContext";

const RepledgeSources: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sources, setSources] = useState<RepledgeSource[]>([]);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<RepledgeSource | null>(null);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const res = await api.get("/repledge-sources");
            setSources(res.data);
        } catch (err) {
            console.error("Failed to fetch repledge sources", err);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/repledge-sources/${deletingId}`);
            setSources(sources.filter((b) => b.id !== deletingId));
            setIsDeleteOpen(false);
            setDeletingId(null);
            showToast("Source deleted successfully", "success");
        } catch (err) {
            console.error("Failed to delete source", err);
            showToast("Failed to delete source", "error");
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingSource(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (source: RepledgeSource) => {
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
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined text-secondary-text dark:text-white">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">account_balance</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary-text dark:text-white">Repledge Sources</h1>
                        <p className="text-xs text-secondary-text dark:text-gray-400">Manage external sources for repledging</p>
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

            <main className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden">
                {/* Grid Section */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                        {sources.map((source) => (
                            <div key={source.id} className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100 dark:border-gray-800">
                                {/* Visual Header */}
                                <div className="relative h-40 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">

                                    {/* Large Icon */}
                                    <span className="material-symbols-outlined text-[5rem] drop-shadow-sm transition-transform group-hover:scale-110 duration-500 text-purple-200 dark:text-purple-500/30">
                                        account_balance
                                    </span>

                                    {/* Edit/Delete Actions */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
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
                                    <div className="absolute -top-6 left-0 right-0 h-6 bg-white dark:bg-gray-900 rounded-t-[2rem]"></div>

                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-primary-text dark:text-white leading-tight line-clamp-1" title={source.name}>{source.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{source.branch || 'Main Branch'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Interest</div>
                                            <div className="font-bold text-purple-600 dark:text-purple-400">{source.default_interest}%</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Validity</div>
                                            <div className="font-bold text-gray-800 dark:text-white">{source.validity_months}M</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-medium">Post-Valid: <span className="text-gray-600 dark:text-gray-300">{source.post_validity_interest}%</span></span>
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 font-bold">{source.payment_method || 'Cash'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sources.length === 0 && (
                            <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">account_balance</span>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No repledge sources configured yet.</p>
                                <button onClick={handleOpenCreate} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
                                    Add your first source
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <RepledgeSourceForm
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
                title="Delete Source?"
                message="Are you sure you want to delete this source? This might affect existing repledges."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteOpen(false)}
                confirmLabel="Delete Source"
                isDangerous={true}
            />
        </div>
    );
};

export default RepledgeSources;
