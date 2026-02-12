import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ChevronLeft,
    Landmark,
    Minus,
    Plus,
    CheckCircle2,
    AlertCircle,
    BadgeCheck
} from 'lucide-react';

const CashReconciliation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [systemExpected, setSystemExpected] = useState(0);
    const [isReconciled, setIsReconciled] = useState(false);
    const [notes, setNotes] = useState('');

    // Denominations state
    const [denominations, setDenominations] = useState({
        500: 0,
        200: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        2: 0,
        1: 0,
    });

    const denomValues = [500, 200, 100, 50, 20, 10, 5, 2, 1];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/cash-reconciliation/today');
            setSystemExpected(Number(response.data.system_expected_amount) || 0);
            setIsReconciled(response.data.is_reconciled);

            if (response.data.is_reconciled && response.data.reconciliation) {
                // If already reconciled, load the data (read-only mode essentially)
                const savedDenoms = response.data.reconciliation.denominations; // Assuming API returns object/array
                if (savedDenoms) {
                    // Need to map if array or object
                    // API sends array: {"500": 10}
                    setDenominations(savedDenoms);
                }
                setNotes(response.data.reconciliation.notes || '');
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reconciliation data", error);
            Swal.fire('Error', 'Failed to fetch system balance', 'error');
            setLoading(false);
        }
    };

    const handleDenomChange = (value: number, change: number) => {
        if (isReconciled) return;
        setDenominations(prev => ({
            ...prev,
            [value]: Math.max(0, (prev[value as keyof typeof prev] || 0) + change)
        }));
    };

    const handleInputChange = (value: number, count: string) => {
        if (isReconciled) return;
        const num = parseInt(count) || 0;
        setDenominations(prev => ({
            ...prev,
            [value]: Math.max(0, num)
        }));
    };

    const physicalCount = useMemo(() => {
        return Object.entries(denominations).reduce((total, [denom, count]) => {
            return total + (Number(denom) * count);
        }, 0);
    }, [denominations]);

    const difference = physicalCount - systemExpected;

    const handleSubmit = async () => {
        if (difference !== 0) {
            const result = await Swal.fire({
                title: 'Discrepancy Detected',
                text: `There is a difference of ₹${difference}. Do you want to proceed with this variance?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Submit',
                cancelButtonText: 'Review'
            });
            if (!result.isConfirmed) return;
        }

        setSubmitting(true);
        try {
            await api.post('/cash-reconciliation', {
                physical_amount: physicalCount,
                denominations: denominations,
                notes: notes
            });

            await Swal.fire('Success', 'Reconciliation submitted successfully', 'success');
            setIsReconciled(true);
            navigate('/staff/dashboard'); // Or stay?
        } catch (error: any) {
            Swal.fire('Error', error.response?.data?.message || 'Submission failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen flex flex-col relative overflow-hidden shadow-2xl">
                {/* Header */}
                <header className="pt-12 pb-4 px-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold tracking-tight">Reconciliation</h1>
                        <div className="w-10 h-10 flex items-center justify-center">
                            {/* <span className="material-icons text-primary">more_horiz</span> */}
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Landmark className="text-primary w-4 h-4" />
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Main Branch</p>
                            </div>
                            <p className="text-sm font-bold">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isReconciled ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 dark:bg-primary/20 text-primary'}`}>
                            <span className={`w-2 h-2 rounded-full ${isReconciled ? 'bg-green-500' : 'bg-primary'}`}></span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide">
                                {isReconciled ? 'Reconciled' : 'Ready to Close'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar pb-[340px] px-4 space-y-3 pt-4">
                    {denomValues.map((denom) => (
                        <div key={denom} className="p-4 bg-white dark:bg-slate-800/50 rounded-xl flex items-center justify-between gap-4 ios-shadow border border-slate-50 dark:border-slate-800">
                            <div className="w-16">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-tighter">Denom.</span>
                                <span className="text-base font-extrabold">₹{denom}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-1">
                                    <button
                                        onClick={() => handleDenomChange(denom, -1)}
                                        disabled={isReconciled}
                                        className="w-12 h-10 flex items-center justify-center text-primary/60 hover:text-primary rounded-full disabled:opacity-50"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                        className="w-16 text-center border-none focus:ring-0 bg-transparent font-bold text-lg p-0"
                                        type="number"
                                        value={denominations[denom as keyof typeof denominations]}
                                        onChange={(e) => handleInputChange(denom, e.target.value)}
                                        disabled={isReconciled}
                                    />
                                    <button
                                        onClick={() => handleDenomChange(denom, 1)}
                                        disabled={isReconciled}
                                        className="w-12 h-10 flex items-center justify-center text-primary/60 hover:text-primary rounded-full disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right w-24">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-tighter">Subtotal</span>
                                <span className="text-sm font-bold">₹{(denominations[denom as keyof typeof denominations] * denom).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 px-2 pb-8">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Remarks / Variance Explanation</label>
                        <textarea
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-sm min-h-[100px] placeholder:text-slate-400 dark:text-white"
                            placeholder="Enter notes regarding discrepancies..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isReconciled}
                        ></textarea>
                    </div>
                </main>

                {/* Footer */}
                <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-40">
                    <div className="bg-[#121826] dark:bg-primary text-white p-5 rounded-2xl mb-4 shadow-xl">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-primary-foreground/60 uppercase tracking-widest">System Expected</p>
                                <p className="text-lg font-bold">₹{systemExpected.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-primary-foreground/60 uppercase tracking-widest">Physical Count</p>
                                <p className="text-lg font-bold">₹{physicalCount.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="col-span-2 pt-3 border-t border-white/10 flex justify-between items-center">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-primary-foreground/60">Difference / Variance</p>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${difference === 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
                                    {difference === 0 ? (
                                        <CheckCircle2 className="text-green-400 w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="text-red-400 w-4 h-4" />
                                    )}
                                    <span className={`${difference === 0 ? 'text-green-400' : 'text-red-400'} font-black text-sm`}>
                                        {difference > 0 ? '+' : ''}₹{difference.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!isReconciled ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {submitting ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <>
                                    <BadgeCheck className="w-5 h-5" />
                                    Reconcile & Close Day
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Reconciled Successfully
                        </div>
                    )}
                    <div className="h-6 w-full"></div>
                </footer>
            </div>
        </div>
    );
};

export default CashReconciliation;
