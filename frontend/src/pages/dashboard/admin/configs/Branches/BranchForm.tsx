import React, { useState, useEffect } from 'react';
import http from '../../../../../api/http';
import { useAuth } from "../../../../../context/AuthContext";

import type { Branch } from '../../../../../types/models';

interface BranchFormData {
    branch_name: string;
    location: string;
}

interface BranchFormProps {
    branch?: Branch | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const BranchForm: React.FC<BranchFormProps> = ({ branch, onSuccess, onCancel }) => {
    const { can } = useAuth();
    const [formData, setFormData] = useState<BranchFormData>({
        branch_name: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (branch) {
            setFormData({
                branch_name: branch.branch_name,
                location: branch.location || '',
            });
        } else {
            setFormData({
                branch_name: '',
                location: '',
            });
        }
        setError(null);
    }, [branch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (branch?.id) {
                await http.put(`/branches/${branch.id}`, formData);
            } else {
                await http.post('/branches', formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving branch:", err);
            setError(err.response?.data?.message || 'Failed to save branch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {branch ? 'Edit Branch' : 'Add New Branch'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {!branch && !can('branch.create') ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                            You don't have permission to create branches.
                        </p>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                ) : branch && !can('branch.update') ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                            You don't have permission to update branches.
                        </p>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Branch Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="branch_name"
                                value={formData.branch_name}
                                onChange={handleChange}
                                required
                                className="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm text-gray-900 dark:text-white outline-none border transition-all"
                                placeholder="e.g. Main Branch"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm text-gray-900 dark:text-white outline-none border transition-all"
                                placeholder="e.g. New York, NY"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                Save Branch
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BranchForm;
