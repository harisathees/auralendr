import React, { useEffect, useState } from "react";
import api from "../../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/Toast/ToastContext";
import ConfirmationModal from "../../../../components/Shared/ConfirmationModal";
import AddCapitalModal from "./AddCapitalModal";
import CapitalSourceForm from "./Form";

interface CapitalSource {
    id: number;
    name: string;
    type: 'owner' | 'investor' | 'bank_loan';
    description: string;
    is_active: boolean;
    total_invested: number;
    attributed_growth?: number;
}

const CapitalSources: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [sources, setSources] = useState<CapitalSource[]>([]);
    const [loading, setLoading] = useState(true);

    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<CapitalSource | null>(null);

    // Add Capital Modal State
    const [isAddCapitalOpen, setIsAddCapitalOpen] = useState(false);
    const [selectedSourceForCapital, setSelectedSourceForCapital] = useState<CapitalSource | null>(null);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [metrics, setMetrics] = useState({ total_invested: 0, total_growth: 0, roi: 0 });

    useEffect(() => {
        fetchSources();
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await api.get("/capital-sources/metrics");
            setMetrics(res.data);
        } catch (err) {
            console.error("Failed to fetch metrics", err);
        }
    };

    const fetchSources = async () => {
        try {
            setLoading(true);
            const res = await api.get("/capital-sources");
            setSources(res.data);
        } catch (err) {
            console.error("Failed to fetch capital sources", err);
            // showToast("Failed to load capital sources", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingSource(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (source: CapitalSource) => {
        setEditingSource(source);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/capital-sources/${deletingId}`);
            setSources(sources.filter((s) => s.id !== deletingId));
            setIsDeleteOpen(false);
            setDeletingId(null);
            showToast("Capital source deleted successfully", "success");
        } catch (err) {
            console.error("Failed to delete source", err);
            showToast("Failed to delete capital source", "error");
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingSource(null);
        fetchSources();
    };

    const handleAddCapitalClick = (source: CapitalSource) => {
        setSelectedSourceForCapital(source);
        setIsAddCapitalOpen(true);
    };

    const handleAddCapitalSuccess = () => {
        setIsAddCapitalOpen(false);
        setSelectedSourceForCapital(null);
        fetchSources();
        fetchMetrics(); // Also refresh metrics
        showToast("Capital added successfully", "success");
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'investor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'bank_loan': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            {/* ... */}

            <main className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total Capital Invested</span>
                        <div className="text-2xl font-black text-primary mt-1">
                            ₹{Number(metrics.total_invested).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total Growth (Interest)</span>
                        <div className="text-2xl font-black text-green-600 mt-1">
                            +₹{Number(metrics.total_growth).toLocaleString()}
                        </div>
                    </div>
                    {/* ROI Card (Optional) */}
                    {/* <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <span className="text-xs font-bold text-gray-500 uppercase">ROI</span>
                        <div className="text-2xl font-black text-blue-600 mt-1">
                            {Number(metrics.roi).toFixed(1)}%
                        </div>
                    </div> */}
                </div>


                {/* List */}
                <section>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                            <p>Loading capital sources...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sources.map((source) => (
                                <div
                                    key={source.id}
                                    onClick={() => navigate(`/admin/finance/capital/${source.id}`)}
                                    className="cursor-pointer bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden relative group"
                                >
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking buttons
                                    >
                                        <button
                                            onClick={() => handleOpenEdit(source)}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(source.id)}
                                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1">
                                        <div className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 ${getTypeColor(source.type)}`}>
                                            {getTypeLabel(source.type)}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{source.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">{source.description || "No description provided."}</p>

                                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-xs text-gray-400 font-semibold uppercase">Invested So Far</span>
                                                    <div className="text-xl font-black text-gray-900 dark:text-white">
                                                        ₹{Number(source.total_invested || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                {/* Growth Display */}
                                                <div>
                                                    <span className="text-xs text-green-500 font-semibold uppercase">Growth</span>
                                                    <div className="text-xl font-black text-green-600 dark:text-green-400">
                                                        +₹{Number(source.attributed_growth || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAddCapitalClick(source); }}
                                                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                    Inject Capital
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sources.length === 0 && (
                                <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">account_balance</span>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No capital sources defined.</p>
                                    <button onClick={handleOpenCreate} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
                                        Create your first source
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Forms */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <CapitalSourceForm
                            initialData={editingSource}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isAddCapitalOpen && selectedSourceForCapital && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <AddCapitalModal
                            source={selectedSourceForCapital}
                            onSuccess={handleAddCapitalSuccess}
                            onCancel={() => setIsAddCapitalOpen(false)}
                        />
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Capital Source?"
                message="Are you sure? This will just deactivate the source, keeping historical data."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteOpen(false)}
                confirmLabel="Deactivate"
                isDangerous={true}
            />
        </div>
    );
};

export default CapitalSources;
