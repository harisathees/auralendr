import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/apiClient';
import ConfigList from '../../../components/Shared/ConfigList';

import type { TransactionCategory as Category } from '../../../types/models';

const TransactionCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/transaction-categories');

            setCategories(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        await api.delete(`/transaction-categories/${id}`);
        fetchCategories();
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Transaction Categories</h2>
            </div>

            <ConfigList
                title="Transaction Categories"
                items={categories}
                loading={loading}
                onAdd={() => navigate('/admin/configs/transaction-categories/create')}
                onEdit={(id) => navigate(`/admin/configs/transaction-categories/edit/${id}`)}
                onDelete={handleDelete}
                renderCustomItem={(category) => (
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                        <div className="flex gap-1 mt-1">
                            {category.is_credit && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Income
                                </span>
                            )}
                            {category.is_debit && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    Expense
                                </span>
                            )}
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default TransactionCategories;
