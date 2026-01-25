import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiClient from "../../../../../api/apiClient";
import GoldCoinSpinner from "../../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

import { Trash2, Edit3, Plus, ArrowRight } from "lucide-react";

interface ReceiptTemplate {
    id: number;
    name: string;
    papersize: {
        width: number;
        height: number;
        unit: string;
    };
    orientation: string;
    status: string;
    updated_at: string;
}

const ReceiptTemplateList: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/receipt-templates");
            setTemplates(response.data || []);
        } catch (error) {
            console.error("Failed to fetch templates", error);
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await apiClient.delete(`/receipt-templates/${id}`);
            fetchTemplates();
            toast.success("Template deleted successfully");
        } catch (error) {
            console.error("Failed to delete template", error);
            toast.error("Failed to delete template");
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    if (loading) return <GoldCoinSpinner text="Loading Templates..." />;

    return (
        <div className="p-6 max-w-[1920px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                            <span className="material-symbols-outlined">receipt_long</span>
                        </span>
                        Receipt Templates
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Manage and design your custom transaction receipts.</p>
                </div>

                <Link
                    to="/admin/configs/templates/receipt/setup"
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create New Template
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Grid */}
            {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="group relative bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none transition-all duration-300"
                        >
                            {/* Paper Preview Placeholder */}
                            <div className="aspect-[3/4] mb-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">sticky_note_2</span>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    {template.papersize.width}×{template.papersize.height}mm
                                </div>
                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 pointer-events-none"></div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">
                                    {template.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${template.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                                        {template.status} • Updated {new Date(template.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/admin/configs/templates/receipt/designer?id=${template.id}`)}
                                    className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    title="Delete Template"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">receipt_long</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Templates Found</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center font-medium italic">
                        Start by creating your first custom receipt template to personalize your workflow.
                    </p>
                    <Link
                        to="/admin/configs/templates/receipt/setup"
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
                    >
                        <Plus className="w-4 h-4" />
                        Get Started
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ReceiptTemplateList;
