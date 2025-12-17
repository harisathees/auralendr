import React, { useState, useEffect } from "react";
import { useRepledgeSource } from "../../hooks/useRepledgeSource";
import { useRepledge } from "../../hooks/useRepledge";
import { useToast } from "../../context";

interface RepledgeItem {
    id?: string;
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
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
    onSettingsClick?: () => void;
}

const RepledgeForm: React.FC<Props> = ({ initialData, onSubmit, loading = false, onCancel, onSettingsClick }) => {
    const { sources, loading: sourcesLoading } = useRepledgeSource();
    const { searchLoanSuggestions: searchLoan } = useRepledge();
    const { showToast } = useToast();

    // Global State
    const [bankId, setBankId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("active");

    const [globalInterest, setGlobalInterest] = useState(0);
    const [globalValidity, setGlobalValidity] = useState(0);
    const [globalPostInt, setGlobalPostInt] = useState(0);
    const [globalPaymentMethod, setGlobalPaymentMethod] = useState("");

    const [items, setItems] = useState<RepledgeItem[]>([{
        id: 'init_1',
        loanId: "", loanNo: "", reNo: "",
        netWeight: 0, grossWeight: 0, stoneWeight: 0,
        amount: 0, processingFee: 0,
        interestPercent: 0, validityPeriod: 0, afterInterestPercent: 0,
        paymentMethod: ""
    }]);

    // Common Input Class matching Create Pledge
    const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400";

    // Select Class (similar to input but with appearance-none if needed, though we supply icon)
    const selectClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 h-12 px-4 shadow-sm outline-none transition-all appearance-none";

    const addMonths = (date: Date, months: number): Date => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setBankId(selectedId);
        const source = sources.find(b => b.id.toString() === selectedId);

        if (source) {
            setGlobalInterest(source.default_interest || 0);
            setGlobalValidity(source.validity_months || 0);
            setGlobalPostInt(source.post_validity_interest || 0);
            setGlobalPaymentMethod(source.payment_method || "");

            if (startDate) {
                const end = addMonths(new Date(startDate), source.validity_months || 0);
                setEndDate(end.toISOString().split('T')[0]);
            }

            setItems(prevItems => prevItems.map(item => ({
                ...item,
                interestPercent: source.default_interest || 0,
                validityPeriod: source.validity_months || 0,
                afterInterestPercent: source.post_validity_interest || 0,
                paymentMethod: source.payment_method || ""
            })));
        } else {
            setGlobalInterest(0);
            setGlobalValidity(0);
            setGlobalPostInt(0);
            setGlobalPaymentMethod("");
        }
    };

    useEffect(() => {
        if (startDate && globalValidity > 0) {
            const end = addMonths(new Date(startDate), globalValidity);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [startDate, globalValidity]);

    useEffect(() => {
        if (initialData && sources.length > 0) {
            setBankId(initialData.repledge_source_id?.toString() || "");
            setStatus(initialData.status || "active");
            setStartDate(initialData.start_date ? initialData.start_date.split('T')[0] : "");
            setEndDate(initialData.end_date ? initialData.end_date.split('T')[0] : "");
            setGlobalInterest(initialData.interest_percent || 0);
            setGlobalValidity(initialData.validity_period || 0);
            setGlobalPostInt(initialData.after_interest_percent || 0);
            setGlobalPaymentMethod(initialData.payment_method || "");

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

    const handleItemChange = (index: number, field: keyof RepledgeItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev];
            if (field === 'amount') {
                const amt = parseFloat(value) || 0;
                const fee = Math.round(Math.min(amt * 0.0012, 200));
                newItems[index] = { ...newItems[index], [field]: value, processingFee: fee };
            } else {
                newItems[index] = { ...newItems[index], [field]: value };
            }
            return newItems;
        });
    };

    const handleLoanBlur = async (index: number) => {
        const loanNo = items[index].loanNo;
        if (!loanNo) return;
        try {
            const loan = await searchLoan(loanNo);
            if (loan) {
                setItems(prev => {
                    const newItems = [...prev];
                    const item = newItems[index];
                    newItems[index] = {
                        ...item,
                        loanId: loan.id,
                        amount: loan.amount,
                        processingFee: Math.round(Math.min(Number(loan.amount) * 0.0012, 200)),
                        grossWeight: loan.gross_weight,
                        netWeight: loan.net_weight,
                        stoneWeight: loan.stone_weight,
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
                net_weight: item.netWeight,
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
        <div className="flex flex-col gap-6 p-4 pb-24 w-full h-full bg-[#f7f8fc] dark:bg-[#1F1B2E]">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-[#f7f8fc] dark:bg-[#1F1B2E] p-4 pb-2 justify-between border-b border-gray-100/50 dark:border-gray-800/50 backdrop-blur-md bg-opacity-95 -mx-4 -mt-4 mb-2">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
                    {initialData ? "Edit Re-Pledge" : "Re-Pledge Entry"}
                </h2>
                <div className="flex w-12 items-center justify-end">
                    {onSettingsClick ? (
                        <button type="button" onClick={onSettingsClick} className="flex items-center justify-center rounded-xl h-10 w-10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-2xl">settings</span>
                        </button>
                    ) : (
                        <button type="button" onClick={onCancel} className="flex items-center justify-center rounded-xl h-10 w-10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bank Details Card */}
            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Bank Details</h3>
                    <span className="material-symbols-outlined text-purple-600">account_balance</span>
                </div>
                <div className="space-y-4">
                    <label className="flex flex-col w-full gap-1.5">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Bank</span>
                        <div className="relative">
                            <select value={bankId} onChange={handleBankChange} className={selectClass}>
                                <option disabled value="">{sourcesLoading ? "Loading..." : "Select a bank"}</option>
                                {sources.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
                    </label>

                    <div className="flex gap-4">
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Interest %</span>
                            <input type="number" value={globalInterest} onChange={(e) => setGlobalInterest(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 12" />
                        </label>
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Validity (Mo)</span>
                            <input type="number" value={globalValidity} onChange={(e) => setGlobalValidity(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 6" />
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Post-Int %</span>
                            <input type="number" value={globalPostInt} onChange={(e) => setGlobalPostInt(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 18" />
                        </label>
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Payment</span>
                            <input type="text" value={globalPaymentMethod} onChange={(e) => setGlobalPaymentMethod(e.target.value)} className={inputClass} placeholder="e.g. Cash" />
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Start Date</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                        </label>
                        <label className="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">End Date</span>
                            <input type="date" value={endDate} readOnly className={`${inputClass} bg-gray-50 dark:bg-gray-700 text-gray-500`} />
                        </label>
                    </div>

                    <label className="flex flex-col w-full gap-1.5">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Status</span>
                        <div className="relative">
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="pending">Pending</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none">check_circle</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Item Details Cards */}
            {items.map((item, index) => (
                <div key={item.id || index} className="flex flex-col rounded-xl bg-[#2E2842] p-5 shadow-lg relative group">
                    <div className="flex items-center justify-between mb-5 border-b border-gray-600/30 pb-3">
                        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Item Details {items.length > 1 ? `#${index + 1}` : ''}</h3>
                        <div className="flex gap-2">
                            {items.length > 1 && (
                                <button type="button" onClick={() => removeItem(index)} className="bg-red-500/20 p-1.5 rounded-lg hover:bg-red-500/40 transition-colors">
                                    <span className="material-symbols-outlined text-red-400 text-xl block">delete</span>
                                </button>
                            )}
                            <div className="bg-purple-600/20 p-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-purple-600 text-xl block">diamond</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col w-full gap-1.5">
                            <label className="text-gray-400 text-sm font-medium">Original Loan No.</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={item.loanNo}
                                    onChange={(e) => handleItemChange(index, "loanNo", e.target.value)}
                                    onBlur={() => handleLoanBlur(index)}
                                    className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 focus:ring-purple-600`}
                                    placeholder="Search by Ln. no"
                                />
                                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-purple-600 rounded-lg text-white pointer-events-none">
                                    <span className="material-symbols-outlined text-sm">search</span>
                                </button>
                            </div>
                        </div>

                        <label className="flex flex-col w-full gap-1.5">
                            <span className="text-gray-400 text-sm font-medium">Re-Pledge No.</span>
                            <input type="text" value={item.reNo} onChange={(e) => handleItemChange(index, "reNo", e.target.value)} className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 focus:ring-purple-600`} placeholder="Enter Re-pledge number" />
                        </label>

                        <div className="grid grid-cols-3 gap-4">
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Gross Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.grossWeight || ''} readOnly className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Stone Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.stoneWeight || ''} readOnly className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Net Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.netWeight || ''} readOnly className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium">Amount</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input type="number" value={item.amount || ''} onChange={(e) => handleItemChange(index, "amount", e.target.value)} className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 pl-8 focus:ring-purple-600 font-bold`} placeholder="0.00" />
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium">Proc. Fee</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input type="number" value={item.processingFee || ''} onChange={(e) => handleItemChange(index, "processingFee", e.target.value)} className={`${inputClass} border-0 bg-white dark:bg-white text-gray-900 pl-8 focus:ring-purple-600`} placeholder="0.00" />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={addItem} className="flex-1 h-14 rounded-xl border-2 border-purple-600/20 bg-transparent text-purple-600 text-base font-bold flex items-center justify-center gap-2 hover:bg-purple-600/5 transition-colors">
                    <span className="material-symbols-outlined">add</span>
                    Add Another
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading} className="flex-[2] h-14 rounded-xl bg-purple-600 text-white text-base font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:bg-purple-600/90 transition-colors disabled:opacity-70">
                    {loading ? "Saving..." : "Save Entry"}
                </button>
            </div>

            <div className="mt-4">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-3 px-1">Recent Entries</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-gray-900 dark:text-white font-bold text-base">Hs-2942 ... 12345</h4>
                                <p className="text-gray-500 text-sm font-medium mt-0.5">Bank: KMB</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide">Active</span>
                        </div>
                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-2"></div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                <span><span className="text-gray-400 mr-1">₹</span>21,000</span>
                                <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                <span>Fee: <span className="text-gray-400 mr-0.5">₹</span>25</span>
                            </div>
                            <span className="text-gray-400 text-xs font-medium">31 Oct. 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepledgeForm;
