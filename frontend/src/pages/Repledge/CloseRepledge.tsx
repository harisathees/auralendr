import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Banknote, Calendar, Landmark, Hash, Wallet, Loader2, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import api from "../../api/apiClient";

// --- Metrics & Calculation Types ---
interface CalculationResults {
    duration: number;
    interestRate: number;
    calculatedInterest: number;
    totalPayable: number;
    finalInterestRate: number;
}

interface Repledge {
    id: number;
    loan_no: string;
    re_no: string;
    amount: number;
    interest_percent: number;
    start_date: string;
    status: string;
    banks?: {
        name: string;
    };
    source?: {
        name: string;
    };
}

// --- Skeleton ---
const CloseRepledgeSkeleton = () => (
    <div className="space-y-6 animate-pulse p-4">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
    </div>
);

// --- Main Component ---

export const CloseRepledge = (): JSX.Element => {
    const { loanId, id: paramId } = useParams<{ loanId?: string, id?: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine ID
    const determinedId = location.state?.id || paramId || loanId;

    // Data State
    const [repledge, setRepledge] = useState<Repledge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form Inputs
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Store selected Payment Source ID
    const [paymentSourceId, setPaymentSourceId] = useState<string>("");
    const [paymentSources, setPaymentSources] = useState<{ id: number; name: string; balance: string }[]>([]);
    const [remarks, setRemarks] = useState<string>("");

    const [calculation, setCalculation] = useState<CalculationResults | null>(null);

    // Saving State
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Fetch Data ---
    useEffect(() => {
        // Fetch Money Sources
        api.get("/money-sources").then(res => {
            if (Array.isArray(res.data)) {
                // Filter for outbound sources as per backend requirement
                const outbound = res.data.filter((m: any) => m.is_outbound);
                setPaymentSources(outbound);
                // Auto-select first if available
                if (outbound.length > 0) {
                    setPaymentSourceId(String(outbound[0].id));
                }
            }
        }).catch(console.error);

        if (!determinedId) return;
        const fetchRepledge = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/repledges/${determinedId}`);
                const data = res.data.data || res.data;
                setRepledge(data);
            } catch (err: any) {
                console.error(err);
                setError("Failed to load repledge details.");
            } finally {
                setLoading(false);
            }
        };
        fetchRepledge();
    }, [determinedId]);

    // --- Calculate Logic ---
    useEffect(() => {
        if (!repledge || !endDate) {
            setCalculation(null);
            return;
        }

        try {
            const start = new Date(repledge.start_date);
            const end = new Date(endDate);

            if (end < start) {
                setCalculation(null);
                return;
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const duration = Math.max(1, diffDays);

            const p = Number(repledge.amount);
            const r = Number(repledge.interest_percent);

            const interest = (p * r * duration) / 36500;

            const calculatedInterest = Math.round(interest);
            const totalPayable = p + calculatedInterest;

            setCalculation({
                duration,
                interestRate: r,
                finalInterestRate: r,
                calculatedInterest,
                totalPayable
            });

        } catch (e) {
            console.error(e);
            setCalculation(null);
        }

    }, [repledge, endDate]);

    // --- Submit Logic ---
    const handleSubmit = async () => {
        if (!repledge || !calculation || !endDate || !paymentSourceId) return;

        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                closed_date: endDate,
                amount_paid: calculation.totalPayable,
                principal_amount: repledge.amount,
                interest_paid: calculation.calculatedInterest,
                payment_source_id: paymentSourceId, // Send ID
                remarks: remarks, // Include remarks
                duration: calculation.duration,
                calculated_interest: calculation.calculatedInterest
            };

            await api.post(`/repledges/${repledge.id}/close`, payload);

            setSaveSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to close repledge.");
            setIsSaving(false);
        }
    };

    // --- Render ---

    if (!determinedId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#161121]">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-[#120e1b] dark:text-white">Invalid Request</h2>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#161121] text-[#120e1b] dark:text-gray-100 font-display min-h-screen pb-32">
            {/* Top App Bar - Matching User Request */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#161121]/80 backdrop-blur-md border-b border-purple-600/10 dark:border-purple-500/10 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-purple-600/10 dark:hover:bg-purple-400/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-[#120e1b] dark:text-white" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-[#120e1b] dark:text-white">Close Repledge</h1>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!repledge || !calculation || !endDate || !paymentSourceId || isSaving || repledge?.status === 'Closed' || repledge?.status === 'closed'}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Processing...' : 'Close'}</span>
                </button>
            </header>

            <main className="max-w-md mx-auto p-4">

                {saveSuccess && (
                    <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Success!</h4>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">Repledge closed successfully.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-red-800 dark:text-red-300">Error</h4>
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <CloseRepledgeSkeleton />
                ) : repledge ? (
                    <>
                        {/* Details Section */}
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70 mb-3 px-1">Details</h3>
                            <div className="bg-white dark:bg-[#1e192b] rounded-xl shadow-sm border border-purple-600/5 dark:border-purple-400/10 overflow-hidden">
                                <div className="p-4 bg-purple-600/5 dark:bg-purple-600/10 border-b border-purple-600/5 dark:border-purple-400/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-600/10 dark:bg-purple-600/20 flex items-center justify-center">
                                        <Landmark className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-purple-600/60 dark:text-purple-400/60 uppercase">Bank / Source</p>
                                        <p className="font-bold text-[#120e1b] dark:text-white">{repledge.banks?.name || repledge.source?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div>
                                        <p className="text-xs text-purple-600/60 dark:text-purple-400/60 mb-1">Original Loan #</p>
                                        <p className="text-sm font-semibold text-[#120e1b] dark:text-white">{repledge.loan_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600/60 dark:text-purple-400/60 mb-1">Re-Pledge No</p>
                                        <p className="text-sm font-semibold text-[#120e1b] dark:text-white">{repledge.re_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600/60 dark:text-purple-400/60 mb-1">Start Date</p>
                                        <p className="text-sm font-semibold text-[#120e1b] dark:text-white">{format(new Date(repledge.start_date), 'dd MMM, yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600/60 dark:text-purple-400/60 mb-1">Interest Rate</p>
                                        <p className="text-sm font-semibold text-[#120e1b] dark:text-white">{repledge.interest_percent}% p.a.</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-purple-600/5 dark:border-purple-400/10">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-purple-600/60 dark:text-purple-400/60">Principal Amount</p>
                                            <p className="text-base font-bold text-[#120e1b] dark:text-white">₹{Number(repledge.amount).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Closing Params Section */}
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70 mb-3 px-1">Closing Params</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-purple-600/70 dark:text-purple-400/70 mb-1.5 ml-1">Closing Date</label>
                                    <div className="relative group">
                                        <input
                                            className="w-full bg-white dark:bg-[#1e192b] border border-purple-600/10 dark:border-purple-400/20 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 dark:text-white outline-none transition-all cursor-pointer placeholder:text-gray-400"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <Calendar className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-purple-600/40 dark:text-purple-400/40 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-purple-600/70 dark:text-purple-400/70 mb-1.5 ml-1">Payment Source</label>
                                    <div className="relative">
                                        <select
                                            value={paymentSourceId}
                                            onChange={(e) => setPaymentSourceId(e.target.value)}
                                            className="w-full bg-white dark:bg-[#1e192b] border border-purple-600/10 dark:border-purple-400/20 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select Source</option>
                                            {paymentSources.map((source) => (
                                                <option key={source.id} value={source.id}>
                                                    {source.name} (₹{Number(source.balance).toLocaleString('en-IN')})
                                                </option>
                                            ))}
                                        </select>
                                        <Hash className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-purple-600/40 dark:text-purple-400/40 pointer-events-none" />
                                    </div>
                                </div>
                                {/* Remarks Input */}
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-purple-600/70 dark:text-purple-400/70 mb-1.5 ml-1">Remarks (Optional)</label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Add any additional notes here..."
                                        rows={2}
                                        className="w-full bg-white dark:bg-[#1e192b] border border-purple-600/10 dark:border-purple-400/20 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 dark:text-white outline-none transition-all placeholder:text-gray-400 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Final Calculation Section */}
                        {calculation && (
                            <section className="mb-8">
                                <div className="bg-purple-600/10 dark:bg-purple-900/10 rounded-xl p-5 border border-purple-600/20 dark:border-purple-500/20">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400">Calculation Summary</h3>
                                        <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded uppercase">Auto-Calculated</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-purple-600/60 dark:text-purple-400/60" />
                                                <p className="text-sm text-[#120e1b] dark:text-gray-200">Duration</p>
                                            </div>
                                            <p className="text-sm font-bold text-[#120e1b] dark:text-gray-200">{calculation.duration} days</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="w-4 h-4 text-purple-600/60 dark:text-purple-400/60" />
                                                <p className="text-sm text-[#120e1b] dark:text-gray-200">Interest Amount</p>
                                            </div>
                                            <p className="text-sm font-bold text-[#120e1b] dark:text-gray-200">₹{calculation.calculatedInterest.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="pt-3 mt-3 border-t border-purple-600/20 dark:border-purple-500/20 flex justify-between items-center">
                                            <p className="text-base font-bold text-purple-600 dark:text-purple-400">Total Payable</p>
                                            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">₹{calculation.totalPayable.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Repledge not found</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// Button component is no longer used directly but if needed, we can keep it or remove it.
// I'll leave the Button component definition removed since I replaced usages with standard <button> tags per the HTML design.

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' | 'outline' | 'destructive', size?: 'default' | 'icon' | 'lg' }>(({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
            {...props}
        />
    );
});
Button.displayName = "Button";

export default CloseRepledge;
