import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/apiClient';
import ConfigList from '../../../components/Shared/ConfigList';
import TransactionCategoryForm from './TransactionCategoryForm';

import type { TransactionCategory as Category } from '../../../types/models';

const TransactionCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/transaction-categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/api/transaction-categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
        fetchCategories();
    };

    return (
        <div className="p-6 relative">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">category</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Transaction Categories</h2>
                        <p className="text-xs text-secondary-text dark:text-gray-400">Manage categories for income and expenses</p>
                    </div>
                </div>
            </div>

            <ConfigList
                title="Transaction Categories"
                items={categories}
                loading={loading}
                onAdd={handleOpenCreate}
                onEdit={(id) => {
                    const cat = categories.find(c => c.id === id);
                    if (cat) handleOpenEdit(cat);
                }}
                onDelete={handleDelete}
                renderCustomItem={(category) => (
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                        <div className="flex gap-1 mt-1">
                            {!category.is_active && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 mr-1">
                                    Inactive
                                </span>
                            )}
                            {category.is_credit && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50">
                                    Income
                                </span>
                            )}
                            {category.is_debit && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50">
                                    Expense
                                </span>
                            )}
                        </div>
                    </div>
                )}
            />

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
                        <TransactionCategoryForm
                            initialData={editingCategory}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionCategories;
