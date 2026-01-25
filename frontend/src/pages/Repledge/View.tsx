import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/apiClient";
import GoldCoinSpinner from "../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { useToast } from "../../context";
import { useAuth } from "../../context/Auth/AuthContext";

interface Jewel {
    id: number;
    jewel_type: string;
    quality: string;
    pieces: number;
    weight: number;
    stone_weight: number;
    net_weight: number;
}

interface Repledge {
    id: number;
    loan_id: number;
    loan_no: string;
    re_no: string;
    amount: number;
    interest_percent: number;
    after_interest_percent: number;
    processing_fee: number;
    validity_period: number;
    start_date: string;
    end_date: string;
    status: string;
    payment_method: string;
    gross_weight: number;
    stone_weight: number;
    net_weight: number;
    source?: {
        name: string;
    };
    loan?: {
        amount: number;
        date: string;
        due_date: string;
        interest_percentage: number;
        processing_fee: number;
        interest_taken: number;
        pledge?: {
            customer?: {
                name: string;
                mobile_no: string;
                media?: Array<{
                    url: string;
                    category: string;
                }>;
            };
            jewels?: Jewel[];
        };
    };
    created_at: string;
}

const View: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id || useParams().id;
    const { showToast } = useToast();
    const { can } = useAuth();
    const [repledge, setRepledge] = useState<Repledge | null>(null);
    const [loading, setLoading] = useState(true);

    const fixImageUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('http://localhost/') && !url.includes(':8000')) {
            return url.replace('http://localhost/', 'http://localhost:8000/');
        }
        return url;
    };

    useEffect(() => {
        if (!id) {
            navigate("/pledges", { state: { tab: 'repledges' } });
            return;
        }

        const fetchData = async () => {
            try {
                const res = await api.get(`/repledges/${id}`);
                setRepledge(res.data);
            } catch (err: any) {
                console.error(err);
                showToast("Failed to fetch repledge details", "error");
                navigate("/pledges", { state: { tab: 'repledges' } });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate, showToast]);

    if (loading) return <GoldCoinSpinner text="Loading Repledge Details..." />;
    if (!repledge) return null;

    const customer = repledge.loan?.pledge?.customer;
    const customerImage = customer?.media?.find(m => m.category === 'customer_image')?.url;
    const jewels = repledge.loan?.pledge?.jewels || [];

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
            {/* TopAppBar */}
            <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-[#e5e7eb] dark:border-[#2d2d2d]">
                <button
                    onClick={() => navigate("/pledges", { state: { tab: 'repledges' } })}
                    className="text-[#120e1b] dark:text-white flex size-12 shrink-0 items-center justify-start focus:outline-none hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h2 className="text-[#120e1b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Repledge Details</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/re-pledge/${id}/edit`)}
                        className="text-purple-600 hover:opacity-70 transition-opacity p-2"
                    >
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    {can('repledge.delete') && (
                        <button
                            onClick={() => {
                                if (confirm("Delete this repledge?")) {
                                    api.delete(`/repledges/${id}`).then(() => {
                                        showToast("Deleted successfully", "success");
                                        navigate("/pledges", { state: { tab: 'repledges' } });
                                    });
                                }
                            }}
                            className="text-red-500 hover:opacity-70 transition-opacity p-2"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 p-4 pb-12 overflow-y-auto">
                {/* 1. Repledge Customer Details Card */}
                <div className="bg-white dark:bg-[#1e192b] rounded-xl p-4 shadow-sm border border-[#e5e7eb] dark:border-[#2d2d2d]">
                    <div className="flex flex-row items-center gap-4">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 shrink-0 border-2 border-purple-600/20"
                            style={{ backgroundImage: `url("${fixImageUrl(customerImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || 'User')}&background=random&color=fff&bold=true`}")` }}
                        >
                        </div>
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                            <p className="text-[#120e1b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] truncate">
                                {customer?.name || 'Unknown Customer'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-purple-600 text-[16px]">fingerprint</span>
                                <p className="text-purple-600 text-sm font-semibold leading-normal">Loan #{repledge.loan_no}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[#6b7280] text-[16px]">account_balance</span>
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-sm font-normal leading-normal">Method: {repledge.payment_method || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Repledge Details */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-[#120e1b] dark:text-white text-base font-bold uppercase tracking-wider ml-1">Repledge Details</h3>
                    <div className="bg-white dark:bg-[#1e192b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2d2d2d] overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-[#f3f4f6] dark:divide-[#2d2d2d]">
                            {/* Row 1 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Bank</p>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600 text-[18px]">account_balance</span>
                                    <p className="text-[#120e1b] dark:text-white text-sm font-semibold truncate">{repledge.source?.name || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Repledge No</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{repledge.re_no}</p>
                            </div>
                            {/* Row 2 (Amount Highlight) */}
                            <div className="col-span-2 flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d] bg-purple-50 dark:bg-purple-900/10">
                                <p className="text-purple-600 text-xs font-medium uppercase">Repledge Amount</p>
                                <p className="text-[#120e1b] dark:text-white text-2xl font-bold">₹{Number(repledge.amount).toLocaleString()}</p>
                            </div>
                            {/* Row 3 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Start Date</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{formatDate(repledge.start_date)}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">End Date</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{formatDate(repledge.end_date)}</p>
                            </div>
                            {/* Row 4 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Interest Rate</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{repledge.interest_percent}% p.a.</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Processing Fee</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">₹{Number(repledge.processing_fee).toLocaleString()}</p>
                            </div>
                            {/* Row 5 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Interest (After Validity)</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{repledge.after_interest_percent || 0}% p.a.</p>
                            </div>
                            <div className="flex flex-col justify-center items-start gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase mb-1">Status</p>
                                <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${repledge.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'}`}>
                                    <span className="material-symbols-outlined text-[14px] mr-1">{repledge.status === 'active' ? 'check_circle' : 'info'}</span>
                                    {repledge.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Original Loan Details */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-[#120e1b] dark:text-white text-base font-bold uppercase tracking-wider ml-1">Original Loan Details</h3>
                    <div className="bg-white dark:bg-[#1e192b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2d2d2d] overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-[#f3f4f6] dark:divide-[#2d2d2d]">
                            {/* Row 1 Highlight */}
                            <div className="col-span-2 flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Original Loan Amount</p>
                                <p className="text-[#120e1b] dark:text-white text-lg font-bold">₹{Number(repledge.loan?.amount).toLocaleString()}</p>
                            </div>
                            {/* Row 2 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Start Date</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{formatDate(repledge.loan?.date)}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Due Date</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{formatDate(repledge.loan?.due_date)}</p>
                            </div>
                            {/* Row 3 */}
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Interest Rate</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">{repledge.loan?.interest_percentage}%</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d]">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Processing Fee</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-semibold">₹{Number(repledge.loan?.processing_fee || 0).toLocaleString()}</p>
                            </div>
                            {/* Row 4 */}
                            <div className="col-span-2 flex flex-row justify-between items-center p-4">
                                <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs font-medium uppercase">Interest Pre-paid</p>
                                <p className="text-[#120e1b] dark:text-white text-sm font-bold">{repledge.loan?.interest_taken ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Jewel Details */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-[#120e1b] dark:text-white text-base font-bold uppercase tracking-wider ml-1">Jewel Details</h3>
                    <div className="flex flex-col gap-3">
                        {jewels.length > 0 ? jewels.map((jewel, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1e192b] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2d2d2d] overflow-hidden">
                                <div className="flex flex-col">
                                    {/* Jewel Header */}
                                    <div className="p-4 border-b border-[#f3f4f6] dark:border-[#2d2d2d] flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-600">
                                            <span className="material-symbols-outlined">diamond</span>
                                        </div>
                                        <div>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold uppercase">{jewel.jewel_type}</p>
                                            <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs uppercase">{jewel.quality} • {jewel.pieces} Pieces</p>
                                        </div>
                                    </div>
                                    {/* Weight Details Grid */}
                                    <div className="grid grid-cols-3 divide-x divide-[#f3f4f6] dark:divide-[#2d2d2d]">
                                        <div className="flex flex-col gap-1 p-4 text-center">
                                            <p className="text-[#6b7280] dark:text-[#9ca3af] text-[10px] font-bold uppercase tracking-wide">Gross Wt</p>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold">{jewel.weight}g</p>
                                        </div>
                                        <div className="flex flex-col gap-1 p-4 text-center">
                                            <p className="text-[#6b7280] dark:text-[#9ca3af] text-[10px] font-bold uppercase tracking-wide">Stone Wt</p>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold">{jewel.stone_weight}g</p>
                                        </div>
                                        <div className="flex flex-col gap-1 p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                                            <p className="text-purple-600 text-[10px] font-bold uppercase tracking-wide">Net Wt</p>
                                            <p className="text-[#120e1b] dark:text-white text-sm font-bold">{jewel.net_weight}g</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white dark:bg-[#1e192b] rounded-xl p-8 text-center border border-[#e5e7eb] dark:border-[#2d2d2d]">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Jewel Data</p>
                            </div>
                        )}

                        {/* Totals Summary if more than 1 jewel */}
                        {jewels.length > 1 && (
                            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-600/20 flex justify-between items-center text-purple-600">
                                <span className="text-xs font-black uppercase tracking-widest">Total Net Wt</span>
                                <span className="text-lg font-black">{repledge.net_weight}g</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-8"></div>
            </div>
        </div>
    );
};

export default View;
