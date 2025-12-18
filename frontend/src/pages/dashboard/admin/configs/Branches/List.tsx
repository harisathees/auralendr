import React, { useEffect, useState } from 'react';
import http from '../../../../../api/http';
import BranchForm from './BranchForm';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../../../components/Shared/Toast';
import ConfirmationModal from '../../../../../components/Shared/ConfirmationModal';
import type { Branch } from '../../../../../types/models';
import { useAuth } from "../../../../../context/AuthContext";
import { Lock } from "lucide-react";

const List: React.FC = () => {
    const { can } = useAuth();
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    // UI state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false,
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; branchId: number | null }>({
        isOpen: false,
        branchId: null,
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const fetchBranches = async () => {
        if (!can('branch.view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await http.get('/branches');
            setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
            showToast('Failed to fetch branches', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleAdd = () => {
        setEditingBranch(null);
        setShowModal(true);
    };

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setShowModal(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ isOpen: true, branchId: id });
    };

    const confirmDelete = async () => {
        if (deleteModal.branchId) {
            try {
                await http.delete(`/branches/${deleteModal.branchId}`);
                showToast('Branch deleted successfully');
                fetchBranches();
            } catch (error) {
                console.error("Error deleting branch:", error);
                showToast('Failed to delete branch', 'error');
            } finally {
                setDeleteModal({ isOpen: false, branchId: null });
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        showToast(editingBranch ? 'Branch updated successfully' : 'Branch created successfully');
        fetchBranches();
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Delete Branch"
                message="Are you sure you want to delete this branch? This action cannot be undone."
                confirmLabel="Delete"
                isDangerous={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, branchId: null })}
            />

            {/* Header */}
            <header className="flex-none flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 shadow-sm border-b border-border-green/50 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary-text dark:text-white">arrow_back</span>
                </button>
                <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Branches</h2>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 p-4 pb-24">

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary-text dark:text-white">All Branches</h3>
                    {can('branch.create') ? (
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add Branch
                        </button>
                    ) : (
                        <button
                            disabled
                            className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed shadow-none flex items-center gap-2"
                            title="Permission denied"
                        >
                            <Lock className="w-4 h-4" />
                            Add Branch
                        </button>
                    )}
                </div>

                {/* List Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        <p className="text-sm font-medium text-gray-500">Loading branches...</p>
                    </div>
                ) : !can('branch.view') ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-surface dark:bg-gray-900 rounded-xl w-full border border-gray-100 dark:border-gray-800">
                            <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Access Denied
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You don't have permission to view branches.
                            </p>
                        </div>
                    </div>
                ) : branches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
                        <span className="material-symbols-outlined text-5xl text-gray-300">store</span>
                        <p className="text-gray-500 font-medium">No branches found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="bg-surface dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-border-green/30 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">store</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary-text dark:text-white text-base">{branch.branch_name}</h4>
                                        {branch.location && (
                                            <div className="flex items-center gap-1 mt-0.5 text-gray-500 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="text-xs font-medium">{branch.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {can('branch.update') ? (
                                        <button
                                            onClick={() => handleEdit(branch)}
                                            className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 cursor-not-allowed"
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                    )}

                                    {can('branch.delete') ? (
                                        <button
                                            onClick={() => handleDeleteClick(branch.id)}
                                            className="h-9 w-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 cursor-not-allowed"
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <BranchForm
                    branch={editingBranch}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default List;
