import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import type { Branch } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { Lock } from "lucide-react";
import { useAuth } from "../../../../context/Auth/AuthContext";

const BranchList: React.FC = () => {
    const { can } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBranches = async () => {
        if (!can('branch.view')) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get("/api/branches");
            setBranches(res.data);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/api/branches/${id}`);
            setBranches(branches.filter((b) => b.id !== id));
        } catch (error) {
            console.error("Failed to delete branch", error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    if (loading) return <GoldCoinSpinner text="Loading Branches..." />;

    if (!can('branch.view')) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-6">Branches</h2>
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Access Denied
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You don't have permission to view branches.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Branches</h2>
                {can('branch.create') ? (
                    <button
                        onClick={() => navigate("/admin/configs/branches/create")}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Branch
                    </button>
                ) : (
                    <button
                        disabled
                        className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg shadow-sm cursor-not-allowed flex items-center gap-2"
                        title="Permission denied"
                    >
                        <Lock className="w-4 h-4" />
                        Add Branch
                    </button>
                )}
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-secondary-text dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Branch Name</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {branches.map((branch) => (
                            <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 font-display font-medium text-primary-text dark:text-white">#{branch.id}</td>
                                <td className="p-4 text-primary-text dark:text-white font-medium">{branch.branch_name}</td>
                                <td className="p-4 text-secondary-text dark:text-gray-400">{branch.location || "-"}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {can('branch.update') ? (
                                            <button
                                                onClick={() => navigate(`/admin/configs/branches/edit/${branch.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-not-allowed"
                                                title="Edit denied"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}

                                        {can('branch.delete') ? (
                                            <button
                                                onClick={() => handleDelete(branch.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-not-allowed"
                                                title="Delete denied"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {branches.length === 0 && (
                    <div className="p-8 text-center text-secondary-text dark:text-gray-400">
                        No branches found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchList;
