import React, { useState, useEffect } from "react";
import axios from "axios";



interface Loan {
    id: number;
    loan_no: string;
    amount: number;
    status: string;
    created_at: string;
    pledge: {
        customer: {
            name: string;
            mobile_no: string;
        };
        branch: {
            branch_name: string;
        };
        user: {
            name: string;
        };
    };
}

const LoansList: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLoans();
    }, [page, searchTerm, statusFilter]);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8000/api/admin-all-loans`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, search: searchTerm, status: statusFilter },
                }
            );
            setLoans(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching loans:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 safe-area-bottom">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">All Loans</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search Loan No, Customer Name, Mobile..."
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="auctioned">Auctioned</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : loans.length > 0 ? (
                    loans.map((loan) => (
                        <div
                            key={loan.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan No</span>
                                    <p className="text-lg font-bold text-gray-900">{loan.loan_no}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'active' ? 'bg-green-100 text-green-800' :
                                    loan.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {loan.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <span className="text-xs text-gray-500">Customer</span>
                                    <p className="font-medium text-gray-800">{loan.pledge?.customer?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">{loan.pledge?.customer?.mobile_no}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Amount</span>
                                    <p className="font-bold text-amber-600">₹{parseFloat(loan.amount as any).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Branch</span>
                                    <p className="text-sm text-gray-700">{loan.pledge?.branch?.branch_name || 'Main'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">By Staff</span>
                                    <p className="text-sm text-gray-700">{loan.pledge?.user?.name || 'Admin'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Date</span>
                                    <p className="text-sm text-gray-700">
                                        {new Date(loan.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No loans found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoansList;
