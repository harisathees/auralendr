import React, { useState, useEffect } from "react";
import { useRepledgeSource } from "../../hooks/useRepledgeSource";
import { useRepledge } from "../../hooks/useRepledge";
import { useToast } from "../../context";

interface RepledgeItem {
    id?: string; // specific row ID for UI key
    loanId: string;
    loanNo: string;
    reNo: string;
    netWeight: number;
    grossWeight: number;
    stoneWeight: number;
    amount: number;
    processingFee: number;
    interestPercent: number;
    validityPeriod: number;
    afterInterestPercent: number;
    paymentMethod: string;
}

interface Props {
    initialData?: any; // For Edit mode (might need adaptation for multi-row edit)
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
}

const RepledgeForm: React.FC<Props> = ({ initialData, onSubmit, loading = false, onCancel }) => {
    // USE CORRECT HOOK HERE
    const { sources, loading: sourcesLoading } = useRepledgeSource();
    const { searchLoanSuggestions: searchLoan } = useRepledge();
    const { showToast } = useToast();

    // Global (Bank) State
    const [bankId, setBankId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("active");

    // Global Bank Config defaults (fetched)
    const [globalInterest, setGlobalInterest] = useState(0);
    const [globalValidity, setGlobalValidity] = useState(0);
    const [globalPostInt, setGlobalPostInt] = useState(0);
    const [globalPaymentMethod, setGlobalPaymentMethod] = useState("");

    // Items State
    const [items, setItems] = useState<RepledgeItem[]>([{
        id: 'init_1',
        loanId: "", loanNo: "", reNo: "",
        netWeight: 0, grossWeight: 0, stoneWeight: 0,
        amount: 0, processingFee: 0,
        interestPercent: 0, validityPeriod: 0, afterInterestPercent: 0,
        paymentMethod: ""
    }]);

    const addMonths = (date: Date, months: number): Date => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    // Bank Change Handler
    const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setBankId(selectedId);

        // Find selected source from list
        const source = sources.find(b => b.id.toString() === selectedId);

        if (source) {
            // Auto-populate Info
            setGlobalInterest(source.default_interest || 0);
            setGlobalValidity(source.validity_months || 0);
            setGlobalPostInt(source.post_validity_interest || 0);
            setGlobalPaymentMethod(source.payment_method || "");

            // Auto Update End Date
            if (startDate) {
                const end = addMonths(new Date(startDate), source.validity_months || 0);
                setEndDate(end.toISOString().split('T')[0]);
            }

            // Update existing items with source defaults
            setItems(prevItems => prevItems.map(item => ({
                ...item,
                interestPercent: source.default_interest || 0,
                validityPeriod: source.validity_months || 0,
                afterInterestPercent: source.post_validity_interest || 0,
                paymentMethod: source.payment_method || ""
            })));
        } else {
            // Reset if no source selected
            setGlobalInterest(0);
            setGlobalValidity(0);
            setGlobalPostInt(0);
            setGlobalPaymentMethod("");
        }
    };

    // Date Change
    useEffect(() => {
        if (startDate && globalValidity > 0) {
            const end = addMonths(new Date(startDate), globalValidity);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [startDate, globalValidity]);

    // Initial Data Population (Edit Mode)
    useEffect(() => {
        if (initialData && sources.length > 0) {
            setBankId(initialData.repledge_source_id?.toString() || "");
            setStatus(initialData.status || "active");
            setStartDate(initialData.start_date ? initialData.start_date.split('T')[0] : "");
            setEndDate(initialData.end_date ? initialData.end_date.split('T')[0] : "");

            // Set Global Defaults from Initial Data (or Source)
            setGlobalInterest(initialData.interest_percent || 0);
            setGlobalValidity(initialData.validity_period || 0);
            setGlobalPostInt(initialData.after_interest_percent || 0);
            setGlobalPaymentMethod(initialData.payment_method || "");

            // Populate Item
            // Edit mode usually handles one item at a time based on current backend "show" response which is single repledge
            setItems([{
                id: initialData.id,
                loanId: initialData.loan_id || "",
                loanNo: initialData.loan_no || "",
                reNo: initialData.re_no || "",
                netWeight: initialData.net_weight || 0,
                grossWeight: initialData.gross_weight || 0,
                stoneWeight: initialData.stone_weight || 0,
                amount: initialData.amount || 0,
                processingFee: initialData.processing_fee || 0,
                interestPercent: initialData.interest_percent || 0,
                validityPeriod: initialData.validity_period || 0,
                afterInterestPercent: initialData.after_interest_percent || 0,
                paymentMethod: initialData.payment_method || ""
            }]);
        }
    }, [initialData, sources]);

    // Item Handler
    const handleItemChange = (index: number, field: keyof RepledgeItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev];
            // If amount changes, update processing fee?
            if (field === 'amount') {
                const amt = parseFloat(value) || 0;
                // Calculate fee: e.g. 0.12% capped at 200 (example logic)
                const fee = Math.round(Math.min(amt * 0.0012, 200));
                newItems[index] = { ...newItems[index], [field]: value, processingFee: fee };
            } else {
                newItems[index] = { ...newItems[index], [field]: value };
            }
            return newItems;
        });
    };

    // Loan Fetch Handler
    const handleLoanBlur = async (index: number) => {
        const loanNo = items[index].loanNo;
        if (!loanNo) return;

        try {
            const loan = await searchLoan(loanNo);
            if (loan) {
                setItems(prev => {
                    const newItems = [...prev];
                    const item = newItems[index]; // current item
                    newItems[index] = {
                        ...item,
                        loanId: loan.id,
                        // Defaults to loan amount, but editable
                        amount: loan.amount,
                        processingFee: Math.round(Math.min(Number(loan.amount) * 0.0012, 200)),
                        grossWeight: loan.gross_weight,
                        netWeight: loan.net_weight,
                        stoneWeight: loan.stone_weight,

                        // Inherit from global
                        interestPercent: globalInterest,
                        validityPeriod: globalValidity,
                        afterInterestPercent: globalPostInt,
                        paymentMethod: globalPaymentMethod,
                    };
                    return newItems;
                });
                showToast("Loan details fetched", "success");
            } else {
                showToast("Loan not found or branch mismatch", "error");
            }
        } catch (e) {
            showToast("Failed to fetch loan", "error");
        }
    };

    const addItem = () => {
        setItems(prev => [...prev, {
            id: `new_${Date.now()}`,
            loanId: "", loanNo: "", reNo: "",
            netWeight: 0, grossWeight: 0, stoneWeight: 0,
            amount: 0, processingFee: 0,
            interestPercent: globalInterest,
            validityPeriod: globalValidity,
            afterInterestPercent: globalPostInt,
            paymentMethod: globalPaymentMethod
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload
        const payload = {
            repledge_source_id: bankId,
            status,
            start_date: startDate,
            end_date: endDate,
            items: items.map(item => ({
                loan_no: item.loanNo,
                re_no: item.reNo,
                repledge_source_id: bankId || null,
                loan_id: item.loanId,
                amount: item.amount,
                processing_fee: item.processingFee,
                net_weight: item.netWeight, // Read-only in UI, sent to backend
                gross_weight: item.grossWeight,
                stone_weight: item.stoneWeight,
                interest_percent: item.interestPercent,
                validity_period: item.validityPeriod,
                after_interest_percent: item.afterInterestPercent,
                payment_method: item.paymentMethod,
            }))
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Source Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-primary-text dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600">account_balance</span>
                    Sources
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Source</span>
                        <select
                            value={bankId}
                            onChange={handleBankChange}
                            required
                            className="form-select h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                        >
                            <option disabled value="">{sourcesLoading ? "Loading sources..." : "Select Source"}</option>
                            {sources.map(b => (
                                <option key={b.id} value={b.id}>{b.name} {b.branch ? `(${b.branch})` : ''}</option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Payment Method</span>
                        <input
                            // Auto-filled but editable
                            value={globalPaymentMethod}
                            onChange={(e) => setGlobalPaymentMethod(e.target.value)}
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                            placeholder="e.g. Cash"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-select h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="closed">Closed / Settled</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Interest %</span>
                        <input
                            type="number"
                            value={globalInterest}
                            onChange={(e) => setGlobalInterest(parseFloat(e.target.value) || 0)}
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                            placeholder="0.00"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Validity (Months)</span>
                        <input
                            type="number"
                            value={globalValidity}
                            onChange={(e) => setGlobalValidity(parseFloat(e.target.value) || 0)}
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                            placeholder="0"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Post-Valid Interest %</span>
                        <input
                            type="number"
                            value={globalPostInt}
                            onChange={(e) => setGlobalPostInt(parseFloat(e.target.value) || 0)}
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                            placeholder="0.00"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Start Date</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">End Date (Auto)</span>
                        <input
                            type="date"
                            value={endDate}
                            readOnly
                            className="form-input h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </label>
                </div>
            </div>

            {/* Items Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-primary-text dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">list_alt</span>
                        Items to Repledge
                    </h3>
                    <button type="button" onClick={addItem} className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                        + Add Item
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                                <th className="p-3 min-w-[150px]">Loan No</th>
                                <th className="p-3 min-w-[150px]">To Re-Pledge No</th>
                                <th className="p-3 min-w-[100px]">Gross Wt</th>
                                <th className="p-3 min-w-[100px]">Stone Wt</th>
                                <th className="p-3 min-w-[100px]">Net Wt</th>
                                <th className="p-3 min-w-[120px]">Amount</th>
                                <th className="p-3 min-w-[120px]">Proc. Fee</th>
                                <th className="p-3 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-2">
                                        <input
                                            value={item.loanNo}
                                            onChange={(e) => handleItemChange(index, "loanNo", e.target.value)}
                                            onBlur={() => handleLoanBlur(index)}
                                            placeholder="Ext Loan No"
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={item.reNo}
                                            onChange={(e) => handleItemChange(index, "reNo", e.target.value)}
                                            placeholder="Re-Pledge No"
                                            required
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={item.grossWeight || ''}
                                            readOnly
                                            placeholder="0.000"
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={item.stoneWeight || ''}
                                            readOnly
                                            placeholder="0.000"
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={item.netWeight || ''}
                                            readOnly
                                            placeholder="0.000"
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm font-bold cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-purple-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={item.processingFee}
                                            onChange={(e) => handleItemChange(index, "processingFee", e.target.value)}
                                            className="form-input w-full h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-500"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                title="Remove Item"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-70"
                >
                    {loading ? "Saving..." : "Save Repledges"}
                </button>
            </div>
        </form>
    );
};

export default RepledgeForm;
