import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import type { Branch } from "../../../../types/models";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { Camera, User, X, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../../../context/Auth/AuthContext";

import { compressImage } from "../../../../utils/imageCompression";

const UserForm: React.FC = () => {
    const { can } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id || useParams().id;
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
        password: "", // Only sent if changed
        role: "staff" as "staff" | "admin",
        branch_id: "" as string | number, // Form select uses string
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [existingPhotoId, setExistingPhotoId] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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
                        phone_number: user.phone_number || "",
                        password: "", // Don't prefill password
                        role: user.role,
                        branch_id: user.branch_id || "",
                    });
                    if (user.photo_url) {
                        setPhotoPreview(user.photo_url);
                    }
                    // Find existing profile photo ID
                    if (user.media && Array.isArray(user.media)) {
                        const profileMedia = user.media.find((m: any) => m.category === 'profile_photo');
                        if (profileMedia) {
                            setExistingPhotoId(profileMedia.id);
                        }
                    }
                })
                .catch((err) => {
                    setError("Failed to load user details.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (formData.phone_number) data.append('phone_number', formData.phone_number);
        if (formData.password) data.append('password', formData.password);
        data.append('role', formData.role);
        if (formData.branch_id) data.append('branch_id', String(formData.branch_id));

        if (photo) {
            try {
                const compressed = await compressImage(photo);
                data.append('files[]', compressed);
            } catch (err) {
                console.warn("Image compression failed, using original", err);
                data.append('files[]', photo);
            }
            data.append('categories[]', 'profile_photo');

            // If replacing existing, delete old one
            if (existingPhotoId) {
                data.append('deleted_file_ids[]', String(existingPhotoId));
            }
        }

        try {
            if (isEdit) {
                data.append('_method', 'PUT'); // Method spoofing for file upload
                await api.post(`/staff/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post("/staff", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-sm">
                                <Camera className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {photoPreview && (isEdit || photo) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhoto(null);
                                        setPhotoPreview(null);
                                    }}
                                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-sm -mr-1 -mt-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Click camera icon to upload photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                                {isEdit ? "Password (Leave blank to keep)" : "Password *"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-11 px-3 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    required={!isEdit}
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
