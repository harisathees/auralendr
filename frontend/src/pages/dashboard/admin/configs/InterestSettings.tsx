import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import ConfigList from "./components/ConfigList";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../../../components/Shared/ConfirmationModal";
import { useToast } from "../../../../context";

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
            const res = await http.get("/interest-rates");
            // Map the data to have a 'name' property for display if needed, or pass custom logic
            // We'll create a formatted display name
            const mapped = res.data.map((r: any) => ({
                ...r,
                name: `${parseFloat(r.rate)}%`,
                description: r.jewel_type ? `For ${r.jewel_type.name} Only` : 'Global (All Types)'
            }));
            setItems(mapped);
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
            await http.delete(`/interest-rates/${deletingId}`);
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

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configurations")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Interest Settings</h2>
            </div>

            <ConfigList
                title="Interest Rates"
                items={items}
                loading={loading}
                itemNameKey="name"
                onAdd={() => navigate("/admin/configs/interest-settings/create")}
                onEdit={(id) => navigate(`/admin/configs/interest-settings/edit/${id}`)}
                onDelete={handleDeleteClick}
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
