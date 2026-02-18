import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import { ArrowLeft, Download } from "lucide-react";
import Pagination from "../../components/Shared/UI/Pagination";

const RepledgeInterestVerificationReport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get("status") || "active";
    const branchId = searchParams.get("branch_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const [page, setPage] = useState(1);
    const [repledges, setRepledges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params: any = { page, per_page: 20, status };
            if (branchId) params.branch_id = branchId;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const response = await api.get('/reports/verification/repledge-interest', { params });
            setRepledges(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Failed to fetch repledge interest report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [page, status, branchId, startDate, endDate]);

    const totalInterestVisible = repledges.reduce((sum, r) => sum + (r.verification?.interest || 0), 0);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#111315]">
            {/* Header */}
            <div className="bg-white dark:bg-[#1A1D1F] border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                            Bank Pledge Interest Verification
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Simple Interest Calculation Verification
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md">
                        {status}
                    </span>
                    <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content - Detailed Table */}
            <div className="flex-1 overflow-auto p-2 md:p-6">
                <div className="bg-white dark:bg-[#1A1D1F] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs md:text-sm border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-2 py-2 md:px-4 md:py-3 w-10">#</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3">Details</th> {/* Loan No / Repledge No */}
                                    <th className="px-2 py-2 md:px-4 md:py-3">Bank/Source</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-right">Amount</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-center">Rate</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-center">Dates</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-center">Duration</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-right">Interest</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-xs">
                                            Calculating...
                                        </td>
                                    </tr>
                                ) : repledges.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-xs">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    repledges.map((r, index) => {
                                        const v = r.verification;
                                        return (
                                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-gray-400 font-medium text-xs">
                                                    {(page - 1) * 20 + index + 1}
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3">
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                        {r.loan?.loan_no || r.loan_no || '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Re: {r.re_no}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-sm text-gray-600 dark:text-gray-300">
                                                    {r.source?.name}
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                                                    ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-center text-xs font-medium text-gray-500">
                                                    {v?.rate}
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-center">
                                                    <div className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded inline-block">
                                                        {v?.start_date} <span className="mx-1">→</span> {v?.end_date}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-center font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/10 rounded-md mx-auto w-fit px-2 text-sm">
                                                    {v?.duration}
                                                </td>
                                                <td className="px-2 py-2 md:px-4 md:py-3 text-right font-bold text-orange-600 text-sm md:text-base">
                                                    ₹{Number(v?.interest || 0).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <td colSpan={6} className="px-2 py-3 text-right font-black uppercase text-gray-600 dark:text-gray-300 text-xs">
                                        Page Total Interest:
                                    </td>
                                    <td colSpan={2} className="px-2 py-3 text-right font-black text-orange-600 text-base">
                                        ₹{totalInterestVisible.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="mt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default RepledgeInterestVerificationReport;
