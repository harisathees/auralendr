import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfigList from "./components/ConfigList";

const RepledgeBanks: React.FC = () => {
    const navigate = useNavigate();
    const [loading] = useState(false);
    const [items] = useState([
        { id: 1, name: "State Bank of India", description: "Main Branch" },
        { id: 2, name: "Muthoot Finance", description: "City Center" }
    ]);

    const handleAdd = () => {
        alert("Add functionality coming soon!");
    };
    const handleEdit = (id: number) => {
        alert(`Edit functionality for ID ${id} coming soon!`);
    };
    const handleDelete = (id: number) => {
        alert(`Delete functionality for ID ${id} coming soon!`);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configurations")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Banks to Repledge</h2>
                    <p className="text-sm text-secondary-text">Manage repledge institutions</p>
                </div>
            </div>

            <ConfigList
                title="Repledge Banks"
                items={items}
                loading={loading}
                itemNameKey="name"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default RepledgeBanks;
