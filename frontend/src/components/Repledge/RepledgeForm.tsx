import React, { useState, useEffect, useRef } from "react";
import { useRepledgeSource } from "../../hooks/useRepledgeSource";
import { useRepledge } from "../../hooks/useRepledge";
import { useToast } from "../../context";
import api from "../../api/apiClient";
import CustomDropdown from "../Shared/CustomDropdown";

import type { RepledgeItem } from "../../types/models";

interface Props {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
    onSettingsClick?: () => void;
}

const RepledgeForm: React.FC<Props> = ({ initialData, onSubmit, loading = false, onSettingsClick }) => {
    const { sources, loading: sourcesLoading } = useRepledgeSource();
    const { fetchLoanDetails } = useRepledge();
    const { showToast } = useToast();

    // Global State - Removed Bank Specifics
    const [status, setStatus] = useState("active");
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await api.get('/api/money-sources');
                setPaymentMethods(res.data || []);
            } catch (e) {
                console.error("Failed to fetch payment methods", e);
            }
        };
        fetchPaymentMethods();
    }, []);

    const [items, setItems] = useState<RepledgeItem[]>([{
        id: 'init_1',
        loanId: "", loanNo: "", reNo: "",
        netWeight: 0, grossWeight: 0, stoneWeight: 0,
        amount: 0, processingFee: 0,
        interestPercent: 0, validityPeriod: 0, afterInterestPercent: 0,
        paymentMethod: "",
        repledgeSourceId: "",
        isBankDetailsOpen: false,

        startDate: (() => {
            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().split('T')[0];
        })(),
        endDate: ""
    }]);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSelectingRef = useRef(false);

    const fetchSuggestions = (query: string, index: number) => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

        if (query.length < 2) {
            setSuggestions([]);
            setIsFetchingSuggestions(false);
            return;
        }

        setIsFetchingSuggestions(true);
        setActiveSuggestionIndex(index);

        fetchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await api.get('/api/pledges', { params: { search: query, suggestions: true } });
                setSuggestions(res.data.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 300);
    };

    // Unified fetch logic
    const fetchAndPopulateLoan = async (loanNo: string, index: number) => {
        if (!loanNo) return;
        try {
            const loanData = await fetchLoanDetails(loanNo);
            if (loanData) {
                setItems(prev => {
                    const newItems = [...prev];
                    const item = newItems[index];

                    newItems[index] = {
                        ...item,
                        loanId: loanData.loan.id.toString(),
                        loanNo: loanData.loan.loan_no,
                        amount: Number(loanData.loan.amount),
                        processingFee: Math.round(Math.min(Number(loanData.loan.amount) * 0.0012, 200)),
                        grossWeight: loanData.totals.gross_weight,
                        netWeight: loanData.totals.net_weight,
                        stoneWeight: loanData.totals.stone_weight,
                        // Keep existing bank settings if set, otherwise 0?
                        // Actually, if bank is NOT set, these remain 0.
                        // If bank IS set, they should persist.
                        // Since we are spreading ...item, existing values persist.
                    };
                    return newItems;
                });
                showToast("Loan details fetched", "success");
            } else {
                showToast("Loan not found", "error");
            }
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || "Failed to fetch loan";
            showToast(errorMsg, "error");
        }
    };

    const handleSelectSuggestion = (suggestion: any, index: number) => {
        isSelectingRef.current = true;

        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], loanNo: suggestion.loan_no };
            return newItems;
        });
        setSuggestions([]);
        setActiveSuggestionIndex(null);

        fetchAndPopulateLoan(suggestion.loan_no, index).finally(() => {
            isSelectingRef.current = false;
        });
    };

    // Common Input Class
    const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400";

    const addMonths = (date: Date, months: number): Date => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    };

    // New Handlers for Item-Specific Bank Logic
    // New Handlers for Item-Specific Bank Logic
    const handleItemBankChange = (index: number, value: string) => {
        const selectedId = value;
        const source = sources.find(b => b.id.toString() === selectedId);

        setItems(prev => {
            const newItems = [...prev];

            // If changing the first item, update ALL items for consistency
            // If changing other items (shouldn't happen with UI hidden, but for safety), just update that one
            const indicesToUpdate = index === 0 ? newItems.map((_, i) => i) : [index];

            indicesToUpdate.forEach(idx => {
                if (source) {
                    const start = newItems[idx].startDate || (() => {
                        const d = new Date();
                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                        return d.toISOString().split('T')[0];
                    })();
                    const end = addMonths(new Date(start), source.validity_months || 0).toISOString().split('T')[0];

                    newItems[idx] = {
                        ...newItems[idx],
                        repledgeSourceId: selectedId,
                        interestPercent: source.default_interest || 0,
                        validityPeriod: source.validity_months || 0,
                        afterInterestPercent: source.post_validity_interest || 0,
                        paymentMethod: source.payment_method || "",
                        startDate: start,
                        endDate: end
                    };
                } else {
                    newItems[idx] = {
                        ...newItems[idx],
                        repledgeSourceId: "",
                        // Maybe reset others? keeping usage simple for now
                    };
                }
            });

            return newItems;
        });
    };

    const toggleItemAccordion = (index: number) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], isBankDetailsOpen: !newItems[index].isBankDetailsOpen };
            return newItems;
        });
    };

    useEffect(() => {
        if (initialData && sources.length > 0) {
            // Note: initialData structure might need adjustment if we assume items have their own sources
            // For now, mapping root repledge_source_id to items if items don't have it

            setStatus(initialData.status || "active");

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
                paymentMethod: initialData.payment_method || "",
                repledgeSourceId: initialData.repledge_source_id?.toString() || "",
                isBankDetailsOpen: false,
                startDate: initialData.start_date ? initialData.start_date.split('T')[0] : (() => {
                    const d = new Date();
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    return d.toISOString().split('T')[0];
                })(),
                endDate: initialData.end_date ? initialData.end_date.split('T')[0] : ""
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
            } else if (field === 'startDate' || field === 'validityPeriod') {
                newItems[index] = { ...newItems[index], [field]: value };
                if (newItems[index].startDate && newItems[index].validityPeriod > 0) {
                    newItems[index].endDate = addMonths(new Date(newItems[index].startDate), newItems[index].validityPeriod).toISOString().split('T')[0];
                }
            } else {
                newItems[index] = { ...newItems[index], [field]: value };
            }
            return newItems;
        });
    };

    const handleLoanInputChange = (index: number, value: string) => {
        handleItemChange(index, "loanNo", value);
        fetchSuggestions(value, index);
    };

    const handleLoanBlur = async (index: number) => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }

        const loanNo = items[index].loanNo;
        if (loanNo && loanNo.length > 3) {
            fetchAndPopulateLoan(loanNo, index);
        }
    };

    const addItem = () => {
        setItems(prev => {
            const firstItem = prev.length > 0 ? prev[0] : null;

            // Default values or inherited from first item
            let newSourceId = "";
            let newInterest = 0;
            let newValidity = 0;
            let newAfterInterest = 0;
            let newPayment = "";

            if (firstItem && firstItem.repledgeSourceId) {
                newSourceId = firstItem.repledgeSourceId;
                newInterest = firstItem.interestPercent;
                newValidity = firstItem.validityPeriod;
                newAfterInterest = firstItem.afterInterestPercent;
                newPayment = firstItem.paymentMethod;
            }

            const newStartDate = (() => {
                const d = new Date();
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                return d.toISOString().split('T')[0];
            })();

            const newEndDate = newValidity > 0
                ? addMonths(new Date(newStartDate), newValidity).toISOString().split('T')[0]
                : "";

            return [...prev, {
                id: `new_${Date.now()}`,
                loanId: "", loanNo: "", reNo: "",
                netWeight: 0, grossWeight: 0, stoneWeight: 0,
                amount: 0, processingFee: 0,
                interestPercent: newInterest,
                validityPeriod: newValidity,
                afterInterestPercent: newAfterInterest,
                paymentMethod: newPayment,
                repledgeSourceId: newSourceId,
                isBankDetailsOpen: false,

                startDate: newStartDate,
                endDate: newEndDate
            }];
        });
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Assume first item's source is primary if single mode? Or just pass null globally and rely on items?
        // Backend seems to expect 'repledge_source_id' at top level too.
        // We can use the first item's source as the "primary" one if strict logical grouping is needed, or just items.

        const primarySourceId = items.length > 0 ? items[0].repledgeSourceId : "";

        const payload = {
            repledge_source_id: primarySourceId, // Top level might be legacy or for grouping
            status,
            start_date: items.length > 0 ? items[0].startDate : (() => {
                const d = new Date();
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                return d.toISOString().split('T')[0];
            })(), // Fallback
            end_date: items.length > 0 ? items[0].endDate : "",
            items: items.map(item => ({
                loan_no: item.loanNo,
                re_no: item.reNo,
                repledge_source_id: item.repledgeSourceId, // Per item
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
        <div className="flex flex-col gap-5 p-2 pb-48 w-full max-w-7xl mx-auto min-h-full overflow-y-auto bg-[#f7f8fc] dark:bg-[#1F1B2E]">


            {/* Item Details Cards */}
            {items.map((item, index) => (
                <div key={item.id || index} className="flex flex-col rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
                    {/* Item Header */}
                    <div className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                                {index + 1}
                            </div>
                            <h3 className="text-gray-900 dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">Details</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                value={item.startDate} onChange={e => handleItemChange(index, 'startDate', e.target.value)}
                                className="w-26 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-2 shadow-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all font-medium"
                                type="date"
                                required
                                title="Date"
                            />
                            <span className="text-gray-400 text-xs material-symbols-outlined">arrow_forward</span>
                            <input
                                value={item.endDate} readOnly
                                className="w-26 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs px-2 shadow-sm cursor-not-allowed outline-none transition-all font-medium"
                                type="date"
                                title="Due Date"
                            />
                            {items.length > 1 && (
                                <button type="button" onClick={() => removeItem(index)} className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-1.5 ml-1 rounded-lg transition-colors group/del">
                                    <span className="material-symbols-outlined text-red-500 text-xl block group-hover/del:scale-110 transition-transform">delete</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-5 space-y-6">

                        {/* Bank Details Accordion Per Item */}
                        {/* Bank Details Accordion Per Item */}
                        {/* Bank Details Accordion Per Item - Only for First Item */}
                        {index === 0 && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Repledge Source</label>
                                            {onSettingsClick && (
                                                <button type="button" onClick={onSettingsClick} className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <CustomDropdown
                                                value={item.repledgeSourceId.toString()}
                                                onChange={(val: string) => handleItemBankChange(index, val.toString())}
                                                options={sources.map(b => ({ value: b.id.toString(), label: b.name, subLabel: b.description }))}
                                                placeholder={sourcesLoading ? "Loading..." : "Select a source"}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleItemAccordion(index)}
                                        className={`mt-6 p-2 rounded-lg transition-colors ${item.isBankDetailsOpen ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'hover:bg-gray-100 text-gray-400 dark:hover:bg-gray-700'}`}
                                        title="Toggle Terms"
                                    >
                                        <span className={`material-symbols-outlined text-xl transition-transform duration-300 ${item.isBankDetailsOpen ? 'rotate-180' : ''}`}>tune</span>
                                    </button>
                                </div>

                                {/* Collapsible Details */}
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${item.isBankDetailsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className={item.isBankDetailsOpen ? '' : 'overflow-hidden'}>
                                        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="flex flex-col gap-1.5">
                                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Interest %</span>
                                                    <input type="number" value={item.interestPercent} onChange={(e) => handleItemChange(index, 'interestPercent', parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 12" />
                                                </label>
                                                <label className="flex flex-col gap-1.5">
                                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Validity (Mo)</span>
                                                    <input type="number" value={item.validityPeriod} onChange={(e) => handleItemChange(index, 'validityPeriod', parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 6" />
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <label className="flex flex-col gap-1.5">
                                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Post-Int %</span>
                                                    <input type="number" value={item.afterInterestPercent} onChange={(e) => handleItemChange(index, 'afterInterestPercent', parseFloat(e.target.value) || 0)} className={inputClass} placeholder="e.g. 18" />
                                                </label>
                                                <label className="flex flex-col gap-1.5">
                                                    <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">Payment</span>
                                                    <div className="relative">
                                                        <CustomDropdown
                                                            value={item.paymentMethod}
                                                            onChange={(val: string) => handleItemChange(index, 'paymentMethod', val.toString())}
                                                            options={paymentMethods.filter(m => m.is_inbound && m.is_active).map(m => ({ value: m.name, label: m.name }))}
                                                            placeholder="Select Method"
                                                        />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col w-full gap-1.5">
                            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Original Loan No.</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={item.loanNo}
                                    onChange={(e) => handleLoanInputChange(index, e.target.value)}
                                    onBlur={() => {
                                        // Delay blur to allow click on suggestion (kept for non-suggestion clicks)
                                        // But if selectingRef is true, we skip via handleLoanBlur
                                        setTimeout(() => {
                                            setActiveSuggestionIndex(null);
                                            handleLoanBlur(index);
                                        }, 200);
                                    }}
                                    className={`${inputClass}`}
                                    placeholder="Search by Ln. no"
                                    autoComplete="off"
                                />
                                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center pointer-events-none">
                                    {activeSuggestionIndex === index && isFetchingSuggestions ? (
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></span>
                                    ) : (
                                        <div className="bg-purple-600 rounded-lg text-white h-full w-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">search</span>
                                        </div>
                                    )}
                                </button>

                                {/* Suggestions Dropdown */}
                                {activeSuggestionIndex === index && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2E2842] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
                                        {suggestions.map((s) => (
                                            <div
                                                key={s.id}
                                                className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                                onClick={() => handleSelectSuggestion(s, index)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{s.loan_no}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{s.customer_name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <label className="flex flex-col w-full gap-1.5">
                            <span className="text-gray-400 text-sm font-medium">Re-Pledge No.</span>
                            <input type="text" value={item.reNo} onChange={(e) => handleItemChange(index, "reNo", e.target.value)} className={inputClass} placeholder="Enter Re-pledge number" />
                        </label>

                        <div className="grid grid-cols-3 gap-4">
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Gross Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.grossWeight ?? ''} readOnly className={`${inputClass} opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Stone Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.stoneWeight ?? ''} readOnly className={`${inputClass} opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium truncate">Net Wt.</span>
                                <div className="relative">
                                    <input type="number" value={item.netWeight ?? ''} readOnly className={`${inputClass} opacity-80`} placeholder="0.00" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium">Amount</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input type="number" value={item.amount ?? ''} onChange={(e) => handleItemChange(index, "amount", e.target.value)} className={`${inputClass} pl-8 font-bold`} placeholder="0.00" />
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0 gap-1.5">
                                <span className="text-gray-400 text-sm font-medium">Proc. Fee</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input type="number" value={item.processingFee ?? ''} onChange={(e) => handleItemChange(index, "processingFee", e.target.value)} className={`${inputClass} pl-8`} placeholder="0.00" />
                                </div>
                            </label>
                        </div>

                        <label className="flex flex-col w-full gap-1.5 mt-4">
                            <span className="text-gray-400 text-sm font-medium">Amount Received</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={(item.amount || 0) - (item.processingFee || 0)}
                                    readOnly
                                    className={`${inputClass} border-purple-200 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 pl-8 font-extrabold text-lg transition-colors`}
                                    placeholder="0.00"
                                />
                            </div>
                        </label>
                    </div>
                </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 pb-2">
                <button
                    type="button"
                    onClick={addItem}
                    className="flex-1 h-14 rounded-xl border-2 border-dashed border-purple-600/30 bg-purple-600/5 text-purple-600 text-base font-bold flex items-center justify-center gap-2 hover:bg-purple-600/10 hover:border-purple-600 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Another
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] h-14 rounded-xl bg-purple-600 text-white text-base font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Save Entry
                        </>
                    )}
                </button>
            </div>


        </div>
    );
};

export default RepledgeForm;
