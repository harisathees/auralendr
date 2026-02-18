
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePledges } from "../../hooks/usePledges";
import { ArrowLeft, Download } from "lucide-react";
import Pagination from "../../components/Shared/UI/Pagination";

const LoanVerificationReport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get("status");
    const branchId = searchParams.get("branch_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const [page, setPage] = useState(1);
    // Removed unused searchTerm

    const params: any = {};
    if (status) params.status = status;
    if (branchId) params.branch_id = branchId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const { pledges, loading, totalPages, totalCount } = usePledges(
        "", // searchTerm
        true,
        page,
        20, // Per page
        params
    );

    const totalAmountVisible = pledges.reduce((sum, p) => sum + Number(p.loan?.amount || 0), 0);

    const getTitle = () => {
        if (!status) return 'All Loans';
        switch (status) {
            case 'active': return 'Active Loans';
            case 'closed': return 'Closed Loans';
            case 'overdue': return 'Overdue Loans';
            default: return 'All Loans';
        }
    };

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
                            {getTitle()}
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date().toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {status || 'ALL'}
                    </span>
                    <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content - Simple Table */}
            <div className="flex-1 overflow-auto p-2 md:p-6">
                <div className="bg-white dark:bg-[#1A1D1F] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs md:text-sm border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-2 py-2 md:px-4 md:py-3 w-10 md:w-16">#</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3">Loan No</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3">Name</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 hidden sm:table-cell">Date</th>
                                    <th className="px-2 py-2 md:px-4 md:py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : pledges.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    pledges.map((p, index) => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-2 py-2 md:px-4 md:py-3 text-gray-400 font-medium text-xs md:text-base">
                                                {(page - 1) * 20 + index + 1}
                                            </td>
                                            <td className="px-2 py-2 md:px-4 md:py-3 font-bold text-gray-900 dark:text-white text-sm md:text-base">
                                                {p.loan?.loan_no || '-'}
                                                <div className="sm:hidden text-xs text-gray-400 font-normal mt-0.5">
                                                    {p.loan?.date ? new Date(p.loan.date).toLocaleDateString('en-GB') : '-'}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 md:px-4 md:py-3 font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-[150px] truncate">
                                                {p.customer?.name || 'Unknown'}
                                            </td>
                                            <td className="px-2 py-2 md:px-4 md:py-3 text-gray-500 font-mono text-sm hidden sm:table-cell">
                                                {p.loan?.date ? new Date(p.loan.date).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                            <td className="px-2 py-2 md:px-4 md:py-3 text-right font-bold text-gray-900 dark:text-white font-mono text-sm md:text-base">
                                                ₹{Number(p.loan?.amount || 0).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {/* Footer */}
                            <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <td colSpan={2} className="px-2 py-2 md:px-4 md:py-3 font-black uppercase text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                                        Count: {totalCount}
                                    </td>
                                    <td className="px-2 py-2 md:px-4 md:py-3 text-right font-black uppercase text-gray-600 dark:text-gray-300 text-xs md:text-sm sm:table-cell hidden">
                                        Page Total:
                                    </td>
                                    <td colSpan={2} className="px-2 py-2 md:px-4 md:py-3 text-right font-black text-primary text-base md:text-lg">
                                        ₹{totalAmountVisible.toLocaleString('en-IN')}
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

export default LoanVerificationReport;
