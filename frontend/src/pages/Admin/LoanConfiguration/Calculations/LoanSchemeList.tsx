import React, { useState, useEffect } from 'react';
import api from '../../../../api/apiClient';
import GoldCoinSpinner from '../../../../components/GoldCoinSpinner';
import LoanSchemeForm from './LoanSchemeForm';
import toast from 'react-hot-toast';

const LoanSchemeList: React.FC = () => {
    const [schemes, setSchemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingScheme, setEditingScheme] = useState<any | null>(null);

    const fetchSchemes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loan-schemes');
            setSchemes(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load schemes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const handleEdit = (scheme: any) => {
        setEditingScheme(scheme);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this scheme?")) return;
        try {
            await api.delete(`/loan-schemes/${id}`);
            toast.success('Scheme deleted');
            fetchSchemes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    }

    const handleFormClose = () => {
        setShowForm(false);
        setEditingScheme(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchSchemes();
    };

    if (loading) return <div className="p-8 flex justify-center"><GoldCoinSpinner /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Calculation Schemes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage interest calculation logic.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Scheme
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemes.map(scheme => (
                    <div key={scheme.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${scheme.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <span className="material-symbols-outlined">calculate</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(scheme)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-500">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button onClick={() => handleDelete(scheme.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{scheme.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5em]">{scheme.description || 'No description'}</p>

                        <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium dark:text-gray-300 capitalize">{scheme.calculation_type.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Rate</span>
                                <span className="font-medium dark:text-gray-300">{scheme.interest_rate}% / {scheme.interest_period}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-medium text-xs px-2 py-0.5 rounded ${scheme.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{scheme.status.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {schemes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">toc</span>
                        <p>No schemes found. Create one to get started.</p>
                    </div>
                )}
            </div>

            {showForm && (
                <LoanSchemeForm
                    scheme={editingScheme}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default LoanSchemeList;
