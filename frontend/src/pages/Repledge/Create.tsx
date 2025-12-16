import React from "react";
import { useNavigate } from "react-router-dom";
import { useRepledge } from "../../hooks/useRepledge";
import RepledgeForm from "../../components/Repledge/RepledgeForm";
import { useToast } from "../../context";

const Create: React.FC = () => {
    const navigate = useNavigate();
    const { saveRepledgeEntry } = useRepledge();
    const { showToast } = useToast();

    const handleSubmit = async (data: any) => {
        try {
            await saveRepledgeEntry(data);
            showToast("Repledge created successfully", "success");
            navigate("/repledge");
        } catch (error) {
            console.error(error);
            showToast("Failed to create repledge", "error");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f7f8fc] dark:bg-gray-900">
            <header className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-primary-text dark:text-white">New Repledge</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                <RepledgeForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
            </main>
        </div>
    );
};

export default Create;
