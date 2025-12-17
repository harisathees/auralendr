import React, { useState, useEffect } from "react";
import { useRepledge, type LoanSuggestion } from "../../hooks/useRepledge";
import { useRepledgeSource } from "../../hooks/useRepledgeSource";
import { useNavigate } from "react-router-dom";

// ---------------------- TYPES ----------------------
interface RepledgeFormData {
    loanId: string;
    loanNo: string;
    reNo: string;
    netWeight: number;
    grossWeight: number;
    stoneWeight: number;
    amount: number;
    processingFee: number;
    bankId: string;
    interestPercent: number;
    validityPeriod: number;
    afterInterestPercent: number;
    paymentMethod: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface FormTemplateData {
    bankId: string;
    interestPercent: number;
    validityPeriod: number;
    afterInterestPercent: number;
    paymentMethod: string;
    startDate: string;
}

// ---------------------- HELPERS ----------------------
const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// ---------------------- MAIN COMPONENT ----------------------
const Repledge: React.FC = () => {
    const navigate = useNavigate();
    const {
        loading,
        error,
        repledgeEntries,
        fetchLoanDetails,
        saveRepledgeEntry,
        deleteRepledgeEntry,
        searchLoanSuggestions,
    } = useRepledge();

    const { sources, loading: sourcesLoading, createSource } = useRepledgeSource();

    const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
        bankId: "",
        interestPercent: 0,
        validityPeriod: 0,
        afterInterestPercent: 0,
        paymentMethod: "",
        startDate: formatDate(new Date()),
    });

    const initialFormState: RepledgeFormData = {
        loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0,
        stoneWeight: 0, amount: 0, processingFee: 0, bankId: "",
        interestPercent: 0, validityPeriod: 0, afterInterestPercent: 0,
        paymentMethod: "", dueDate: "", startDate: formatDate(new Date()), endDate: "",
        status: "active",
    };

    const [forms, setForms] = useState<RepledgeFormData[]>([initialFormState]);
    const [activeFormIndex, setActiveFormIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
    const [showBankManagement, setShowBankManagement] = useState(false);
    const [repledgeError, setRepledgeError] = useState('');

    // Handle Amount Change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        const calculatedFee = Math.round(Math.min(amount * 0.0012, 200));

        const updatedForms = [...forms];
        const currentFormState = { ...updatedForms[activeFormIndex] };
        currentFormState.amount = amount;
        currentFormState.processingFee = calculatedFee;
        updatedForms[activeFormIndex] = currentFormState;
        setForms(updatedForms);
    };

    const currentForm = forms[activeFormIndex] || initialFormState;

    // Effects
    useEffect(() => {
        const currentLoanNo = forms[activeFormIndex]?.loanNo || "";
        setSearchQuery(currentLoanNo);
        setShowSuggestions(false);
    }, [activeFormIndex, forms]);

    useEffect(() => {
        const activeForm = forms[activeFormIndex];
        if (activeForm) {
            setFormTemplate({
                bankId: activeForm.bankId,
                interestPercent: activeForm.interestPercent,
                validityPeriod: activeForm.validityPeriod,
                afterInterestPercent: activeForm.afterInterestPercent,
                paymentMethod: activeForm.paymentMethod,
                startDate: activeForm.startDate,
            });
        }
    }, [forms, activeFormIndex]);

    useEffect(() => {
        if (isSuggestionSelected) return;
        const debounceTimer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                const results = await searchLoanSuggestions(searchQuery);
                setSuggestions(results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, isSuggestionSelected, searchLoanSuggestions]);

    useEffect(() => {
        if (currentForm && currentForm.startDate && currentForm.validityPeriod > 0) {
            try {
                const start = new Date(currentForm.startDate);
                const end = addMonths(start, currentForm.validityPeriod);
                const formattedEndDate = formatDate(end);
                if (formattedEndDate !== currentForm.endDate) {
                    updateFormData(activeFormIndex, "endDate", formattedEndDate);
                }
            } catch (e) {
                console.error("Invalid date for calculation", e);
            }
        }
    }, [currentForm?.startDate, currentForm?.validityPeriod, activeFormIndex]);

    // Handlers
    const handleSourceSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bankId = e.target.value;
        const selectedSource = sources.find(b => b.id.toString() === bankId.toString());
        setForms(currentForms => {
            const newForms = [...currentForms];
            const formToUpdate = { ...newForms[activeFormIndex] };
            formToUpdate.bankId = bankId;
            if (selectedSource) {
                formToUpdate.interestPercent = selectedSource.default_interest || 0;
                formToUpdate.validityPeriod = selectedSource.validity_months || 0;
                formToUpdate.afterInterestPercent = selectedSource.post_validity_interest || 0;
                formToUpdate.paymentMethod = selectedSource.payment_method || "";
            } else {
                formToUpdate.interestPercent = 0;
                formToUpdate.validityPeriod = 0;
                formToUpdate.afterInterestPercent = 0;
                formToUpdate.paymentMethod = "";
            }
            newForms[activeFormIndex] = formToUpdate;
            return newForms;
        });
    };

    const handleLoanSearch = async (loanNo: string) => {
        if (!loanNo.trim()) return;
        setRepledgeError('');

        // Check if repledged locally or via API if needed (API check logic can be added to hook)
        // For now assuming fetchLoanDetails handles logic or returns error
        const result = await fetchLoanDetails(loanNo);

        if (result) {
            // Simple check if loan is already repledged (if API provides that info)
            // Or if 'isLoanAlreadyRepledged' logic was moved to backend
            const updatedForms = [...forms];
            updatedForms[activeFormIndex] = {
                ...updatedForms[activeFormIndex],
                loanId: result.loan.id,
                loanNo: result.loan.loan_no,
                netWeight: result.totals.net_weight,
                grossWeight: result.totals.gross_weight,
                stoneWeight: result.totals.stone_weight,
                amount: result.loan.amount,
                processingFee: Math.round(Math.min(result.loan.amount * 0.0012, 200)),
            };
            setForms(updatedForms);
        } else {
            // Error handled in hook/toast
        }
    };

    const addNewForm = () => {
        const newForm: RepledgeFormData = {
            ...initialFormState,
            ...formTemplate,
        };
        setForms([...forms, newForm]);
        setActiveFormIndex(forms.length);
        setSearchQuery("");
    };

    const removeForm = (index: number) => {
        if (forms.length > 1) {
            const updatedForms = forms.filter((_, i) => i !== index);
            setForms(updatedForms);
            if (activeFormIndex >= updatedForms.length) {
                setActiveFormIndex(updatedForms.length - 1);
            }
        }
    };

    const updateFormData = (index: number, field: keyof RepledgeFormData, value: any) => {
        const updatedForms = [...forms];
        updatedForms[index] = { ...updatedForms[index], [field]: value };
        setForms(updatedForms);
    };

    const getSourceName = (sourceId: string) => {
        const source = sources.find(b => b.id.toString() === sourceId.toString());
        return source ? source.name : "N/A";
    };

    const handleSave = async () => {
        try {
            await Promise.all(forms.map(form => {
                if (form.loanNo && form.reNo) {
                    return saveRepledgeEntry({
                        loan_id: form.loanId || null,
                        loan_no: form.loanNo,
                        re_no: form.reNo,
                        net_weight: form.netWeight,
                        gross_weight: form.grossWeight,
                        stone_weight: form.stoneWeight,
                        amount: form.amount,
                        processing_fee: form.processingFee,
                        repledge_source_id: form.bankId || null,
                        interest_percent: form.interestPercent,
                        validity_period: form.validityPeriod,
                        after_interest_percent: form.afterInterestPercent,
                        payment_method: form.paymentMethod || null,
                        start_date: form.startDate || null,
                        end_date: form.endDate || null,
                        due_date: form.dueDate || null,
                        status: form.status || "active",
                    });
                }
                return Promise.resolve();
            }));

            alert('All entries saved successfully!');
            setForms([initialFormState]);
            setActiveFormIndex(0);
            setSearchQuery("");
        } catch (e) {
            console.error("Save failed:", e);
            alert('Failed to save entries.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            try {
                await deleteRepledgeEntry(id);
                alert("Entry deleted successfully!");
            } catch (e) {
                alert("Failed to delete entry.");
            }
        }
    };


    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-[#f7f8fc] dark:bg-gray-900 font-sans text-[#1F1B2E] dark:text-white antialiased [&::-webkit-scrollbar]:hidden">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center bg-[#f7f8fc]/95 dark:bg-gray-900/95 p-4 pb-2 justify-between border-b border-gray-100/50 dark:border-gray-800/50 backdrop-blur-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center rounded-xl h-10 w-10 text-[#1F1B2E] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors absolute left-4"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-[#1F1B2E] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-10 pr-10">Re-Pledge Entry</h2>
                <div className="flex w-12 items-center justify-end absolute right-4">
                    <button
                        onClick={() => setShowBankManagement(true)}
                        className="flex items-center justify-center rounded-xl h-10 w-10 text-[#1F1B2E] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4 pb-24">
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                {/* Bank Details Card */}
                <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#1F1B2E] dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">Bank Details</h3>
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">account_balance</span>
                    </div>

                    <div className="space-y-4">
                        <label className="flex flex-col w-full">
                            <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Bank</span>
                            <div className="relative">
                                <select
                                    value={currentForm.bankId}
                                    onChange={handleSourceSelectionChange}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#f7f8fc] dark:bg-gray-900 h-10 px-4 pr-10 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors appearance-none text-[#1F1B2E] dark:text-white"
                                >
                                    <option disabled value="">{sourcesLoading ? "Loading sources..." : "Select a source"}</option>
                                    {sources.map((source) => (
                                        <option key={source.id} value={source.id}>
                                            {source.name} {source.branch ? `- ${source.branch}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none">expand_more</span>
                            </div>
                        </label>

                        <div className="flex gap-3">
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Interest %</span>
                                <input
                                    type="number"
                                    placeholder="e.g. 12"
                                    value={currentForm.interestPercent || ""}
                                    onChange={(e) => updateFormData(activeFormIndex, "interestPercent", parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#f7f8fc] dark:bg-gray-900 h-10 px-4 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-gray-400 text-[#1F1B2E] dark:text-white"
                                />
                            </label>
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Validity (Mo)</span>
                                <input
                                    type="number"
                                    placeholder="e.g. 6"
                                    value={currentForm.validityPeriod || ""}
                                    onChange={(e) => updateFormData(activeFormIndex, "validityPeriod", parseInt(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8fc] h-10 px-4 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-gray-400"
                                />
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Post-Int %</span>
                                <input
                                    type="number"
                                    placeholder="e.g. 18"
                                    value={currentForm.afterInterestPercent || ""}
                                    onChange={(e) => updateFormData(activeFormIndex, "afterInterestPercent", parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8fc] h-10 px-4 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-gray-400"
                                />
                            </label>
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Payment</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Cash"
                                    value={currentForm.paymentMethod}
                                    onChange={(e) => updateFormData(activeFormIndex, "paymentMethod", e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-[#f7f8fc] h-10 px-4 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-gray-400"
                                />
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Start Date</span>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={currentForm.startDate}
                                        onChange={(e) => updateFormData(activeFormIndex, "startDate", e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#f7f8fc] dark:bg-gray-900 h-10 px-4 text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-gray-400 text-[#1F1B2E] dark:text-white dark:[color-scheme:dark]"
                                    />
                                    {/* Calendar icon hidden by native date picker usually, but kept for design match if supported */}
                                    {/* <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 text-xl pointer-events-none">calendar_today</span> */}
                                </div>
                            </label>
                            <label className="flex flex-col flex-1 min-w-0">
                                <span className="text-[#1F1B2E]/70 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">End Date</span>
                                <input
                                    type="date"
                                    value={currentForm.endDate}
                                    readOnly
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#f7f8fc] dark:bg-gray-800 h-10 px-4 text-sm font-medium focus:outline-none transition-colors text-gray-500 dark:text-gray-400 dark:[color-scheme:dark]"
                                />
                            </label>
                        </div>

                        <label className="flex flex-col w-full">
                            <span className="text-[#1F1B2E]/70 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Status</span>
                            <div className="relative">
                                <div className="w-full rounded-xl border border-green-200 bg-green-50/50 h-10 px-4 flex items-center gap-2 dark:bg-green-900/30 dark:border-green-800">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                    <span className="text-green-700 text-sm font-bold tracking-wide dark:text-green-400">Active</span>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-[20px] dark:text-green-500">verified</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Item Details Card */}
                <div className="flex flex-col rounded-xl bg-[#2E2842] p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-5 border-b border-gray-600/30 pb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Item Details</h3>
                            {/* Simple Form Switcher inside header */}
                            {forms.length > 1 && (
                                <div className="flex gap-1 ml-2">
                                    {forms.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveFormIndex(idx)}
                                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeFormIndex === idx ? 'bg-white text-[#2E2842]' : 'bg-gray-600/50 text-gray-300'}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-purple-600/20 p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-purple-600 text-xl block">diamond</span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Original Loan No.</label>
                            <div className="relative">
                                <input
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setIsSuggestionSelected(false); setRepledgeError(''); }}
                                    className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 pl-4 pr-12 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                    placeholder="Search by Ln. no"
                                    type="text"
                                />
                                <button
                                    onClick={() => handleLoanSearch(searchQuery)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-purple-600 rounded-lg text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">search</span>
                                </button>
                            </div>
                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto mx-1 [&::-webkit-scrollbar]:hidden">
                                    {loading ? (<div className="p-3 text-sm text-center dark:text-gray-400">Searching...</div>) : suggestions.length > 0 ? (
                                        suggestions.map((s) => (
                                            <div key={s.loan_no} onClick={() => { setIsSuggestionSelected(true); setSearchQuery(s.loan_no); handleLoanSearch(s.loan_no); setShowSuggestions(false); }} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-b-0">
                                                <div className="font-bold text-[#1F1B2E] dark:text-white">{s.loan_no}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Amount: ₹{s.amount}</div>
                                            </div>
                                        ))
                                    ) : (<div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No results found.</div>)}
                                </div>
                            )}
                            {repledgeError && <p className="text-red-400 text-xs mt-1 ml-1">{repledgeError}</p>}
                        </div>

                        <label className="flex flex-col w-full">
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Re-Pledge No.</span>
                            <input
                                value={currentForm.reNo}
                                onChange={(e) => updateFormData(activeFormIndex, 'reNo', e.target.value)}
                                className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 px-4 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                placeholder="Enter Re-pledge number"
                                type="text"
                            />
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            <label className="flex flex-col min-w-0">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1 truncate">Gross Wt.</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={currentForm.grossWeight || ""}
                                        onChange={(e) => updateFormData(activeFormIndex, 'grossWeight', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 pl-3 pr-6 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1 truncate">Stone Wt.</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={currentForm.stoneWeight || ""}
                                        onChange={(e) => updateFormData(activeFormIndex, 'stoneWeight', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 pl-3 pr-6 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1 truncate">Net Wt.</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={currentForm.netWeight || ""}
                                        onChange={(e) => updateFormData(activeFormIndex, 'netWeight', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 pl-3 pr-6 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">g</span>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col min-w-0">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Amount</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        value={currentForm.amount || ""}
                                        onChange={handleAmountChange}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-gray-900 h-10 pl-8 pr-3 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </label>
                            <label className="flex flex-col min-w-0">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">Proc. Fee</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        value={currentForm.processingFee || ""}
                                        readOnly
                                        className="w-full rounded-xl border-0 bg-gray-200 dark:bg-gray-600 h-10 pl-8 pr-3 text-[#1F1B2E] dark:text-white placeholder:text-gray-400 text-sm font-medium focus:outline-none text-opacity-70 cursor-not-allowed"
                                        placeholder="0.00"
                                    />
                                </div>
                            </label>
                        </div>

                        {forms.length > 1 && (
                            <div className="flex justify-end pt-2">
                                <button onClick={() => removeForm(activeFormIndex)} className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">delete</span> Remove this form
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 justify-center">
                    <button
                        onClick={addNewForm}
                        className="h-10 px-6 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Another
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="h-10 px-8 rounded-xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:bg-purple-600/90 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>

                {/* Recent Entries */}
                <div className="mt-4">
                    <h3 className="text-[#1F1B2E] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-3 px-1">Recent Entries</h3>
                    <div className="flex flex-col gap-3">
                        {repledgeEntries.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">No recent entries</div>
                        ) : (
                            repledgeEntries.map((entry) => (
                                <div key={entry.id} className="flex flex-col bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-[#1F1B2E] dark:text-white font-bold text-sm">{entry.loan_no} ... {entry.re_no}</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">Source: {getSourceName(entry.repledge_source_id || '')}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${entry.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-2"></div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                            <span><span className="text-gray-400 mr-1">₹</span>{entry.amount}</span>
                                            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                                            <span>Fee: <span className="text-gray-400 mr-0.5">₹</span>{entry.processing_fee}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium">{formatDate(new Date(entry.created_at))}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

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

                            <QuickAddSourceForm onSourceAdded={() => { alert("New source added!"); }} createSource={createSource} loading={loading} />

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
        </div>
    );
};

// ---------------------- QUICK ADD SOURCE FORM ----------------------
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
