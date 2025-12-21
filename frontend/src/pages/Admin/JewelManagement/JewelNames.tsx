import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import ConfigList from "../../../components/Shared/ConfigList";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../../components/Shared/ConfirmationModal";
import { useToast } from "../../../context";

const JewelNamesIndex: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchItems = async () => {
        try {
            const res = await api.get("/jewel-names");
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch jewel names", error);
            showToast("Failed to load jewel names", "error");
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
            await api.delete(`/jewel-names/${deletingId}`);
            setItems(items.filter(i => i.id !== deletingId));
            setIsDeleteOpen(false);
            setDeletingId(null);
            showToast("Jewel name deleted successfully", "success");
        } catch (error) {
            console.error("Delete failed", error);
            showToast("Failed to delete. It might be in use.", "error");
            setIsDeleteOpen(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Jewel Names</h2>
            </div>

            <ConfigList
                title="Jewel Names"
                items={items}
                loading={loading}
                itemNameKey="name"
                onAdd={() => navigate("/admin/configs/jewel-names/create")}
                onEdit={(id) => navigate(`/admin/configs/jewel-names/edit/${id}`)}
                onDelete={handleDeleteClick}
            />

            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Jewel Name?"
                message="Are you sure you want to delete this jewel name? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteOpen(false)}
                confirmLabel="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default JewelNamesIndex;
