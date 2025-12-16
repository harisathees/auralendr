import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../api/http";
import RepledgeForm from "../../components/Repledge/RepledgeForm";
import { useToast } from "../../context";
import GoldCoinSpinner from "../../components/Shared/GoldCoinSpinner";

const Edit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepledge = async () => {
            try {
                const res = await http.get(`/repledges/${id}`);
                setInitialData(res.data);
            } catch (error) {
                console.error(error);
                showToast("Failed to load repledge details", "error");
                navigate("/repledge");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRepledge();
    }, [id, navigate, showToast]);

    const handleSubmit = async (data: any) => {
        try {
            await http.put(`/repledges/${id}`, data);
            showToast("Repledge updated successfully", "success");
            navigate("/repledge");
        } catch (error) {
            console.error(error);
            showToast("Failed to update repledge", "error");
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading Repledge..." />;

    return (
        <div className="flex flex-col h-full bg-[#f7f8fc] dark:bg-gray-900">
            <header className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-primary-text dark:text-white">Edit Repledge</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                <RepledgeForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
            </main>
        </div>
    );
};

export default Edit;
