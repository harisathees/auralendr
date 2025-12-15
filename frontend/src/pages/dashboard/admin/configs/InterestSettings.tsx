import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InterestSettings: React.FC = () => {
    const navigate = useNavigate();

    // Placeholder content
    // const [schemes] = useState([]);

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/configurations")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Interest Settings</h2>
                    <p className="text-sm text-secondary-text">Configure loan interest rates and schemes</p>
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="text-center py-10">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">construction</span>
                    <p className="text-secondary-text">Configuration options coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default InterestSettings;
