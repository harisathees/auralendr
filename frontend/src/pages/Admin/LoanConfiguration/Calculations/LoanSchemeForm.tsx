import React, { useState, useEffect } from 'react';
import api from '../../../../api/apiClient';
import toast from 'react-hot-toast';
import GoldCoinSpinner from '../../../../components/GoldCoinSpinner';

interface LoanSchemeFormProps {
    scheme?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const LoanSchemeForm: React.FC<LoanSchemeFormProps> = ({ scheme, onClose, onSuccess }) => {
    const [name, setName] = useState(scheme?.name || '');
    const [description, setDescription] = useState(scheme?.description || '');
    const [interestRate, setInterestRate] = useState(scheme?.interest_rate || '');
    const [interestPeriod, setInterestPeriod] = useState(scheme?.interest_period || 'monthly');
    const [calculationType, setCalculationType] = useState(scheme?.calculation_type || 'flat');
    const [status, setStatus] = useState(scheme?.status || 'active');

    // Config for Tiered Scheme
    const [tiers, setTiers] = useState<any[]>(scheme?.scheme_config?.tiers || [{ months: '', rate: '' }]);

    const [saving, setSaving] = useState(false);

    const calculationTypes = [
        { value: 'flat', label: 'Flat Interest' },
        { value: 'tiered', label: 'Tiered (Time Based)' },
        { value: 'day_basis_tiered', label: 'Day Basis (Tiered)' },
        { value: 'day_basis_compound', label: 'Day Basis (Compound)' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: any = {
            name,
            description,
            interest_rate: Number(interestRate),
            interest_period: interestPeriod,
            calculation_type: calculationType,
            status,
            scheme_config: {}
        };

        if (calculationType === 'tiered' || calculationType === 'day_basis_tiered') {
            payload.scheme_config.tiers = tiers.filter(t => t.months && t.rate).map(t => ({ // Filter empty
                months: Number(t.months),
                rate: Number(t.rate)
            }));
        }

        try {
            if (scheme) {
                await api.put(`/loan-schemes/${scheme.id}`, payload);
                toast.success('Scheme updated successfully');
            } else {
                await api.post('/loan-schemes', payload);
                toast.success('Scheme created successfully');
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save scheme');
        } finally {
            setSaving(false);
        }
    };

    const handleAddTier = () => {
        setTiers([...tiers, { months: '', rate: '' }]);
    };

    const handleRemoveTier = (index: number) => {
        const newTiers = [...tiers];
        newTiers.splice(index, 1);
        setTiers(newTiers);
    };

    const handleTierChange = (index: number, field: string, value: string) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {scheme ? 'Edit Loan Scheme' : 'New Loan Scheme'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheme Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                placeholder='e.g., Gold Standard'
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calculation Type</label>
                            <select
                                value={calculationType}
                                onChange={e => setCalculationType(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            >
                                {calculationTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={interestRate}
                                    onChange={e => setInterestRate(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                                <select
                                    value={interestPeriod}
                                    onChange={e => setInterestPeriod(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white min-h-[80px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Tiered Config Section */}
                    {(calculationType === 'tiered' || calculationType === 'day_basis_tiered') && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Interest Tiers</h3>
                                <button type="button" onClick={handleAddTier} className="text-sm text-purple-600 font-medium hover:underline">+ Add Tier</button>
                            </div>
                            <div className="space-y-2">
                                {tiers.map((tier, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Months >"
                                                value={tier.months}
                                                onChange={e => handleTierChange(idx, 'months', e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Rate %"
                                                value={tier.rate}
                                                onChange={e => handleTierChange(idx, 'rate', e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                                            />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveTier(idx)} className="text-red-500 hover:text-red-700">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500">Define tiers: "Months &gt; 6" means applies after 6 months.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {saving ? <GoldCoinSpinner svgClassName="w-5 h-5" /> : 'Save Scheme'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanSchemeForm;
