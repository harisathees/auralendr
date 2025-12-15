import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import { useNavigate, useParams } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/GoldCoinSpinner";

const InterestRateForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [rate, setRate] = useState("");
    const [estimationPercentage, setEstimationPercentage] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [jewelTypeId, setJewelTypeId] = useState<string>("");
    const [jewelTypes, setJewelTypes] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch jewel types
                const typesRes = await http.get("/jewel-types");
                setJewelTypes(typesRes.data);

                if (isEdit) {
                    const res = await http.get(`/interest-rates/${id}`);
                    setRate(res.data.rate);
                    setEstimationPercentage(res.data.estimation_percentage);
                    setJewelTypeId(res.data.jewel_type_id ? String(res.data.jewel_type_id) : "");
                }
            } catch (err: any) {
                console.error(err);
                setError("Failed to load details.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                rate,
                estimation_percentage: estimationPercentage,
                jewel_type_id: jewelTypeId || null
            };

            if (isEdit) {
                await http.put(`/interest-rates/${id}`, payload);
            } else {
                await http.post("/interest-rates", payload);
            }
            navigate("/admin/configs/interest-settings");
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
                    onClick={() => navigate("/admin/configs/interest-settings")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold text-primary-text dark:text-white">
                    {isEdit ? "Edit Interest Rate" : "Add Interest Rate"}
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
                            Interest Rate (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                            placeholder="e.g. 1.50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            Estimation Percentage (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={estimationPercentage}
                            onChange={(e) => setEstimationPercentage(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                            placeholder="e.g. 75.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-1">
                            Applies To Jewel Type
                        </label>
                        <div className="relative">
                            <select
                                value={jewelTypeId}
                                onChange={(e) => setJewelTypeId(e.target.value)}
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="">Global (All Types)</option>
                                {jewelTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500">expand_more</span>
                        </div>
                        <p className="text-xs text-secondary-text mt-1">Leave empty for a global option available to all jewel types.</p>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/configs/interest-settings")}
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

export default InterestRateForm;
