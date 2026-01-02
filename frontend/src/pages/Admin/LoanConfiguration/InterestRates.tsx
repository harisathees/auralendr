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
            const res = await api.get("/api/interest-rates");
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
            await api.delete(`/api/interest-rates/${deletingId}`);
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-8 min-w-[200px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.jewel_type ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-600'}`}>
                    <span className="material-symbols-outlined text-sm">
                        {item.jewel_type ? 'diamond' : 'public'}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-secondary-text block">Jewel Type</span>
                    <span className="font-medium text-primary-text dark:text-white">
                        {item.jewel_type ? item.jewel_type.name : 'Universal'}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-secondary-text block">Interest</span>
                    <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                        {parseFloat(item.rate)}%
                    </span>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                <div>
                    <span className="text-xs text-secondary-text block">Estimation</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {parseFloat(item.estimation_percentage)}%
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">

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
