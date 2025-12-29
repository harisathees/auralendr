import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import { useNavigate, useParams } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

import { useAuth } from "../../../../context/Auth/AuthContext";

const BranchForm: React.FC = () => {
    const { can } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        branch_name: "",
        location: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            if (!can('branch.update')) return; // Dont fetch if no permission
            setLoading(true);
            api.get(`/branches/${id}`)
                .then((res) => {
                    setFormData({
                        branch_name: res.data.branch_name,
                        location: res.data.location || "",
                    });
                })
                .catch((err) => {
                    setError("Failed to load branch details.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            if (isEdit) {
                await api.put(`/branches/${id}`, formData);
            } else {
                await api.post("/branches", formData);
            }
            navigate("/admin/configs/branches");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save branch.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading..." />;

    // Permission Check
    const hasPermission = isEdit ? can('branch.update') : can('branch.create');
    if (!hasPermission) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You don't have permission to {isEdit ? 'update' : 'create'} branches.
                </p>
                <button
                    onClick={() => navigate("/admin/branches")}
                    className="mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs/branches")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold text-primary-text dark:text-white">
                    {isEdit ? "Edit Branch" : "Add New Branch"}
                </h2>
            </div>

            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.branch_name}
                            onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/configs/branches")}
                            className="px-4 py-2 text-secondary-text dark:text-gray-300 hover:text-primary-text dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg shadow-md transition-all flex items-center justify-center min-w-[100px] ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {saving ? "Saving..." : (isEdit ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;
