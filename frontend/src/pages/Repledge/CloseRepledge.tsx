import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from '../../api/apiClient';
import GoldCoinSpinner from '../../components/GoldCoinSpinner';
import toast from 'react-hot-toast';

// --- Types ---
interface RepledgeData {
    id: number;
    loan_no: string;
    amount: number; // Principal
    date: string;
    status: string;
    // Add other fields as needed from Repledge/Loan model
}

// --- Text/Label Component ---
const InfoRow = ({ label, value, valueClass = 'text-primary-text dark:text-gray-200' }: { label: string, value: React.ReactNode, valueClass?: string }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <span className="text-secondary-text dark:text-gray-400">{label}</span>
        <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
);

// --- Layout Components ---
const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-purple-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="material-symbols-outlined text-purple-600">{icon}</span>
            <h3 className="text-gray-800 dark:text-white text-xl font-bold">{title}</h3>
        </div>
        {children}
    </section>
);

const LoadingState: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm">
        <GoldCoinSpinner text={text} svgClassName="w-20 h-20" />
    </div>
);

const SuccessState: React.FC = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Repledge Closed!</h2>
            <p className="text-gray-500 dark:text-gray-400">Successfully closed the repledge. Redirecting...</p>
        </div>
    </div>
);

const ErrorState: React.FC<{ error: string, onBack: () => void }> = ({ error, onBack }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">warning</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Go Back
            </button>
        </div>
    </div>
);

const CloseRepledge: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id || useParams().id;

    // State
    const [repledgeData, setRepledgeData] = useState<RepledgeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Inputs
    const [closedDate, setClosedDate] = useState('');
    const [principalPaid, setPrincipalPaid] = useState<string>(''); // Often full amount
    const [interestPaid, setInterestPaid] = useState<string>('');
    const [balancePaid, setBalancePaid] = useState<string>(''); // Total Amount Paid

    // Payment Source
    const [moneySources, setMoneySources] = useState<any[]>([]);
    const [paymentSourceId, setPaymentSourceId] = useState<string>('');

    // Fetch Data
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setClosedDate(today);

        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch Repledge
                const repledgeRes = await api.get(`/repledges/${id}`);
                const rData = repledgeRes.data.data || repledgeRes.data;
                const loan = rData.loan || {};

                setRepledgeData({
                    id: rData.id,
                    loan_no: loan.loan_no,
                    amount: Number(rData.amount),
                    date: rData.date,
                    status: rData.status,
                });

                // Auto-fill principal
                setPrincipalPaid(String(rData.amount));

                // Fetch Money Sources
                const sourceRes = await api.get('/money-sources');
                if (Array.isArray(sourceRes.data)) {
                    setMoneySources(sourceRes.data);
                    // Filter for outbound? usually all sources can trigger outbound but marked
                    const validSources = sourceRes.data.filter((s: any) => s.is_outbound !== 0); // Assuming API returns is_outbound
                    // Fallback if not filtered or different structure
                    if (validSources.length > 0) {
                        setPaymentSourceId(String(validSources[0].id));
                    } else if (sourceRes.data.length > 0) {
                        setPaymentSourceId(String(sourceRes.data[0].id));
                    }
                }

            } catch (err: any) {
                console.error("Fetch error", err);
                setError(err.response?.data?.message || 'Failed to fetch repledge data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Auto-calculate Total Paid
    useEffect(() => {
        const p = Number(principalPaid) || 0;
        const i = Number(interestPaid) || 0;
        setBalancePaid(String(p + i));
    }, [principalPaid, interestPaid]);


    const handleClose = async () => {
        if (!repledgeData || !paymentSourceId || !balancePaid) return;
        setSaving(true);
        try {
            await api.post(`/repledges/${repledgeData.id}/close`, {
                closed_date: closedDate,
                amount_paid: Number(balancePaid),
                principal_amount: Number(principalPaid),
                interest_paid: Number(interestPaid),
                payment_source_id: Number(paymentSourceId),
                remarks: "Closed via App",
            });
            setShowSuccessMessage(true);
            setTimeout(() => navigate('/repledges'), 2000);
        } catch (err: any) {
            console.error("Close error", err);
            toast.error(err.response?.data?.message || "Failed to close repledge");
            setSaving(false);
        }
    };

    if (loading) return <LoadingState text="Fetching Repledge..." />;
    if (showSuccessMessage) return <SuccessState />;
    if (error || !repledgeData) return <ErrorState error={error || 'Repledge not found'} onBack={() => navigate('/repledges')} />;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex-none">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Close Repledge</h1>
                            <span className="text-xs text-gray-500">Loan #{repledgeData.loan_no}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto p-4 space-y-6 w-full pb-20">
                {/* Summary Using Purple Theme for Repledge */}
                <Section title="Repledge Summary" icon="inventory_2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <InfoRow label="Repledge Amount" value={`₹${repledgeData.amount.toLocaleString('en-IN')}`} valueClass="text-purple-600 font-bold text-lg" />
                        <InfoRow label="Date" value={new Date(repledgeData.date).toLocaleDateString('en-GB')} />
                        <InfoRow
                            label="Current Status"
                            value={repledgeData.status.toUpperCase()}
                            valueClass={repledgeData.status === 'closed' ? 'text-red-600 bg-red-50 px-2 rounded' : 'text-green-600 bg-green-50 px-2 rounded'}
                        />
                    </div>
                </Section>

                {/* Inputs */}
                <Section title="Closure Details" icon="fact_check">
                    <div className="space-y-5">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Date</label>
                            <input
                                type="date"
                                value={closedDate}
                                onChange={(e) => setClosedDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all dark:text-white"
                            />
                        </div>

                        {/* Principal & Interest */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Principal Paid (₹)</label>
                                <input
                                    type="number"
                                    value={principalPaid}
                                    onChange={(e) => setPrincipalPaid(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest Paid (₹)</label>
                                <input
                                    type="number"
                                    value={interestPaid}
                                    onChange={(e) => setInterestPaid(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Payment Source */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Debited From (Source)</label>
                            <div className="relative">
                                <select
                                    value={paymentSourceId}
                                    onChange={(e) => setPaymentSourceId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all dark:text-white appearance-none"
                                >
                                    <option value="" disabled>Select Source</option>
                                    {moneySources.map(source => (
                                        <option key={source.id} value={source.id}>{source.name} (₹{source.balance})</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        {/* Total Paid Display */}
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-xl flex justify-between items-center">
                            <span className="text-purple-800 dark:text-purple-300 font-medium">Total Amount Paid</span>
                            <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">₹{Number(balancePaid).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </Section>

                {/* Action */}
                <div className="pt-4 pb-8">
                    <button
                        onClick={handleClose}
                        disabled={saving || repledgeData.status === 'closed' || !paymentSourceId || !balancePaid}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <GoldCoinSpinner svgClassName="w-6 h-6" /> : <><span className="material-symbols-outlined">check_circle</span> <span>Confirm & Close Repledge</span></>}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CloseRepledge;
