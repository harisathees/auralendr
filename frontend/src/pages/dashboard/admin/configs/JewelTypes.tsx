import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import ConfigList from "./components/ConfigList";
import { useNavigate } from "react-router-dom";

const JewelTypesIndex: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const res = await http.get("/jewel-types");
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch jewel types", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await http.delete(`/jewel-types/${id}`);
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete. It might be in use.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configs")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Jewel Types</h2>
            </div>

            <ConfigList
                title="Jewel Types"
                items={items}
                loading={loading}
                itemNameKey="name"
                onAdd={() => navigate("/admin/configs/jewel-types/create")}
                onEdit={(id) => navigate(`/admin/configs/jewel-types/edit/${id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default JewelTypesIndex;
