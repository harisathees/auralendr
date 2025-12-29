import React, { useState } from "react";
import { useRepledge } from "../../hooks/useRepledge";
import { useRepledgeSource } from "../../hooks/useRepledgeSource";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context";
import RepledgeForm from "../../components/Repledge/RepledgeForm";

const Repledge: React.FC = () => {
    const navigate = useNavigate();
    const {
        loading,
        saveRepledgeEntry,
    } = useRepledge();

    // Note: useRepledgeSource hook is used inside RepledgeForm for listing, 
    // but we use it here for Bank Management Modal if needed.
    const { createSource: createSourceOrigin, sources } = useRepledgeSource();
    const { showToast } = useToast();

    const [showBankManagement, setShowBankManagement] = useState(false);

    const handleFormSubmit = async (payload: any) => {
        try {
            // RepledgeForm sends a payload with 'items' array.
            // Backend expects single entry creation.
            // We loop and save each item.

            await Promise.all(payload.items.map((item: any) => {
                const entry = {
                    repledge_source_id: payload.repledge_source_id,
                    status: payload.status,
                    start_date: payload.start_date,
                    end_date: payload.end_date,

                    // Item Specifics
                    loan_no: item.loan_no,
                    re_no: item.re_no,
                    loan_id: item.loan_id,
                    amount: item.amount,
                    processing_fee: item.processing_fee,
                    net_weight: item.net_weight, // Backend expects underscore? RepledgeEntry interface shows underscore
                    gross_weight: item.gross_weight,
                    stone_weight: item.stone_weight,
                    interest_percent: item.interest_percent,
                    validity_period: item.validity_period,
                    after_interest_percent: item.after_interest_percent,
                    payment_method: item.payment_method,
                    // due_date ? calculated by backend or passed? 
                    // RepledgeForm didn't explicitly calculate due_date, but start_date + validity = end_date. 
                    // Usually due_date = end_date.
                };
                return saveRepledgeEntry(entry);
            }));

            showToast('Entries saved successfully!', 'success');
            navigate(-1);
        } catch (e: any) {
            console.error("Save failed:", e);
            // Handle Laravel style validation errors
            const errors = e.response?.data?.errors;
            let firstError = "";
            if (errors) {
                const firstKey = Object.keys(errors)[0];
                if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey].length > 0) {
                    firstError = errors[firstKey][0];
                }
            }
            const errorMsg = firstError || e.response?.data?.message || 'Failed to save entries.';
            showToast(errorMsg, 'error');
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-[#f7f8fc] dark:bg-gray-900 font-sans text-[#1F1B2E] dark:text-white antialiased">
            {/* We render RepledgeForm which includes the full UI (Header, Cards, etc) */}
            <RepledgeForm
                onSubmit={handleFormSubmit}
                onCancel={() => navigate(-1)}
                loading={loading}
                onSettingsClick={() => setShowBankManagement(true)}
            />

            {/* Bank Management Modal */}
            {showBankManagement && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-10 fade-in [&::-webkit-scrollbar]:hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#1F1B2E] dark:text-white">Bank Management</h3>
                            <button onClick={() => setShowBankManagement(false)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <QuickAddSourceForm onSourceAdded={() => { alert("New source added!"); }} createSource={createSourceOrigin} loading={false} />

                        <div className="mt-6">
                            <h4 className="font-bold text-[#1F1B2E] mb-3">Available Banks</h4>
                            <div className="space-y-2">
                                {sources.map((source) => (
                                    <div key={source.id} className="flex justify-between items-center p-3 bg-[#f7f8fc] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <div>
                                            <div className="font-bold text-[#1F1B2E] dark:text-white text-sm">{source.name}</div>
                                            {source.branch && <div className="text-xs text-gray-500 dark:text-gray-400">{source.branch}</div>}
                                        </div>
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-600/10 dark:bg-purple-900/30 px-2 py-1 rounded-md">{source.default_interest}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---------------------- QUICK ADD SOURCE FORM (Keep existing) ----------------------
const QuickAddSourceForm = ({ onSourceAdded, createSource, loading }: { onSourceAdded: () => void, createSource: Function, loading: boolean }) => {

    const [formData, setFormData] = useState({
        name: '', code: '', branch: '', defaultInterest: '',
        validityMonths: '', postValidityInterest: '', paymentMethod: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Source name is required.");
            return;
        }
        await createSource(formData);
        setFormData({ name: '', code: '', branch: '', defaultInterest: '', validityMonths: '', postValidityInterest: '', paymentMethod: '' });
        onSourceAdded();
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Quick Add Source</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase">Source Name *</label>
                    <input placeholder="e.g. State Bank of India" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Source Code</label>
                        <input placeholder="Optional" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Branch Name</label>
                        <input placeholder="Optional" value={formData.branch} onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Interest %</label>
                        <input type="number" placeholder="e.g. 12" value={formData.defaultInterest} onChange={(e) => setFormData(prev => ({ ...prev, defaultInterest: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase">Validity (Mo)</label>
                        <input type="number" placeholder="e.g. 6" value={formData.validityMonths} onChange={(e) => setFormData(prev => ({ ...prev, validityMonths: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase">Int. after valid</label>
                    <input type="number" placeholder="e.g. 18" value={formData.postValidityInterest} onChange={(e) => setFormData(prev => ({ ...prev, postValidityInterest: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase">Default Payment</label>
                    <input placeholder="e.g. Online" value={formData.paymentMethod} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 text-sm outline-none" />
                </div>
                <button type="submit" disabled={loading || !formData.name.trim()} className="w-full h-10 bg-black text-white rounded font-medium hover:bg-gray-800 transition">
                    {loading ? 'Adding...' : 'Add Source'}
                </button>
            </form>
        </div>
    );
};

export default Repledge;
