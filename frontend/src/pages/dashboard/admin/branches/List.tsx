import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { Branch } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/GoldCoinSpinner";

const BranchList: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBranches = async () => {
        try {
            const res = await http.get("/branches");
            setBranches(res.data);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await http.delete(`/branches/${id}`);
            setBranches(branches.filter((b) => b.id !== id));
        } catch (error) {
            console.error("Failed to delete branch", error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    if (loading) return <GoldCoinSpinner text="Loading Branches..." />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Branches</h2>
                <button
                    onClick={() => navigate("/admin/branches/create")}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Branch
                </button>
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
                                        <button
                                            onClick={() => navigate(`/admin/branches/edit/${branch.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(branch.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
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
