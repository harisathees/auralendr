import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import { useNavigate, useParams } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/GoldCoinSpinner";

const JewelTypeForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            http.get(`/jewel-types/${id}`)
                .then((res) => {
                    setName(res.data.name);
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to load details.");
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
                await http.put(`/jewel-types/${id}`, { name });
            } else {
                await http.post("/jewel-types", { name });
            }
            navigate("/admin/configs/jewel-types");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading..." />;

    return (
        <div className="p-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs/jewel-types")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold text-primary-text dark:text-white">
                    {isEdit ? "Edit Jewel Type" : "Add Jewel Type"}
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
                            Type Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                            placeholder="e.g. Gold"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/configs/jewel-types")}
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

export default JewelTypeForm;
