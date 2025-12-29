import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import type { Branch } from "../../../../types/models";
import { useNavigate, useParams } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

import { useAuth } from "../../../../context/Auth/AuthContext";

const UserForm: React.FC = () => {
    const { can } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // Only sent if changed
        role: "staff" as "staff" | "admin",
        branch_id: "" as string | number, // Form select uses string
    });

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Fetch branches for dropdown
    useEffect(() => {
        api.get("/branches").then(res => setBranches(res.data)).catch(console.error);
    }, []);

    // Fetch user details if editing
    useEffect(() => {
        if (isEdit) {
            if (!can('user.update')) return;
            setLoading(true);
            api.get(`/staff/${id}`)
                .then((res) => {
                    const user = res.data;
                    setFormData({
                        name: user.name,
                        email: user.email,
                        password: "", // Don't prefill password
                        role: user.role,
                        branch_id: user.branch_id || "",
                    });
                })
                .catch((err) => {
                    setError("Failed to load user details.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const payload: any = { ...formData };
        // If password is empty in edit mode, don't send it (handled by backend)
        if (isEdit && !payload.password) {
            delete payload.password;
        }
        // Handle empty branch_id
        if (payload.branch_id === "") {
            payload.branch_id = null;
        }

        try {
            if (isEdit) {
                await api.put(`/staff/${id}`, payload);
            } else {
                await api.post("/staff", payload);
            }
            navigate("/admin/configs/users");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save user.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading..." />;

    // Permission Check
    const hasPermission = isEdit ? can('user.update') : can('user.create');
    if (!hasPermission) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You don't have permission to {isEdit ? 'update' : 'create'} users.
                </p>
                <button
                    onClick={() => navigate("/admin/configs/users")}
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
                    onClick={() => navigate("/admin/configs/users")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold text-primary-text dark:text-white">
                    {isEdit ? "Edit User" : "Add New User"}
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
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            {isEdit ? "Password (Leave blank to keep current)" : "Password *"}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required={!isEdit}
                            minLength={8}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as "staff" | "admin" })}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                                Branch
                            </label>
                            <select
                                value={formData.branch_id}
                                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                <option value="">All Branches (Global Access)</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.branch_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/configs/users")}
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

export default UserForm;
