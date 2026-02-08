import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import ConfigList from "../../../components/Shared/ConfigList";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../../components/Shared/ConfirmationModal";
import { useToast } from "../../../context";

const InterestSettings: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchItems = async () => {
        try {
            const res = await api.get("/interest-rates");
            // Map the data to have a 'name' property for display if needed, or pass custom logic
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch interest rates", error);
            showToast("Failed to load interest rates", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/interest-rates/${deletingId}`);
            setItems(items.filter(i => i.id !== deletingId));
            setIsDeleteOpen(false);
            setDeletingId(null);
            showToast("Interest rate deleted successfully", "success");
        } catch (error) {
            console.error("Delete failed", error);
            showToast("Failed to delete.", "error");
            setIsDeleteOpen(false);
        }
    };

    const renderItem = (item: any) => (
        <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors">
            {/* Header with Icon and Jewel Type */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-primary">
                        {item.jewel_type ? 'diamond' : 'public'}
                    </span>
                </div>
                <div className="flex-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jewel Type</span>
                    <h3 className="font-bold text-lg text-primary dark:text-primary mt-0.5">
                        {item.jewel_type ? item.jewel_type.name : 'Universal'}
                    </h3>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Interest Rate</span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-2xl text-gray-900 dark:text-white">{parseFloat(item.rate)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Post Validity</span>
                    <div className="flex items-baseline gap-1">
                        {item.post_validity_rate ? (
                            <>
                                <span className="font-bold text-2xl text-gray-900 dark:text-white">{parseFloat(item.post_validity_rate)}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                            </>
                        ) : (
                            <span className="text-2xl text-gray-400 dark:text-gray-600">—</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Estimation</span>
                    <div className="flex items-baseline gap-1">
                        {item.estimation_percentage ? (
                            <>
                                <span className="font-bold text-2xl text-gray-900 dark:text-white">{parseFloat(item.estimation_percentage)}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                            </>
                        ) : (
                            <span className="text-2xl text-gray-400 dark:text-gray-600">—</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configurations")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Interest Settings</h2>
            </div>

            <ConfigList
                title="Interest Rates"
                items={items}
                loading={loading}
                onAdd={() => navigate("/admin/configs/interest-settings/create")}
                onEdit={(id) => navigate(`/admin/configs/interest-settings/edit/${id}`)}
                onDelete={handleDeleteClick}
                renderCustomItem={renderItem}
            />

            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Interest Rate?"
                message="Are you sure you want to delete this interest rate?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteOpen(false)}
                confirmLabel="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default InterestSettings;
