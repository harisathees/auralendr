import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/apiClient';
import { toast } from 'react-hot-toast';

interface Props { }

const BusinessVerificationReport: React.FC<Props> = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const type_param = queryParams.get('type');
    const type = type_param || 'portfolio';

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type,
                page: page.toString(),
            });

            const response = await api.get(`/reports/verification/business-overview?${params}`);
            setData(response.data.data || []);
            setHasMore(!!response.data.next_page_url);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch verification data');
        } finally {
            setLoading(false);
        }
    };

    const titles: Record<string, string> = {
        portfolio: 'Portfolio Verification',
        assets: 'Assets Value Verification',
        customers: 'Total Customers Verification',
        net_profit: 'Net Profit Verification',
        gross_profit: 'Gross Profit Verification',
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const renderHeaders = () => {
        switch (type) {
            case 'portfolio':
                return (
                    <tr>
                        <th className="px-6 py-3 text-left">Loan No</th>
                        <th className="px-6 py-3 text-left">Customer</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                );
            case 'assets':
                return (
                    <tr>
                        <th className="px-6 py-3 text-left">Ref</th>
                        <th className="px-6 py-3 text-left">Customer</th>
                        <th className="px-6 py-3 text-right">Net Wt (g)</th>
                        <th className="px-6 py-3 text-right">Value</th>
                    </tr>
                );
            case 'customers':
                return (
                    <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Mobile</th>
                        <th className="px-6 py-3 text-left">Place</th>
                        <th className="px-6 py-3 text-center">Pledges</th>
                    </tr>
                );
            case 'net_profit':
            case 'gross_profit':
                return (
                    <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-center">Type</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                );
            default: return null;
        }
    };

    const renderRows = () => {
        if (!data.length) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                        No records found
                    </td>
                </tr>
            );
        }

        return data.map((item: any, idx) => {
            switch (type) {
                case 'portfolio':
                    return (
                        <tr key={item.id || idx} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-4">{item.loan_no}</td>
                            <td className="px-6 py-4">{item.pledge?.customer?.name}</td>
                            <td className="px-6 py-4 text-gray-500">{formatDate(item.created_at)}</td>
                            <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                    );
                case 'assets':
                    return (
                        <tr key={item.id || idx} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-4">{item.loan?.loan_no ?? item.id}</td>
                            <td className="px-6 py-4">{item.customer?.name}</td>
                            <td className="px-6 py-4 text-right">{item.total_net_weight}g</td>
                            <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.asset_value)}</td>
                        </tr>
                    );
                case 'customers':
                    return (
                        <tr key={item.id || idx} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">{item.mobile_no}</td>
                            <td className="px-6 py-4">{item.place}</td>
                            <td className="px-6 py-4 text-center">{item.pledges_count}</td>
                        </tr>
                    );
                case 'net_profit':
                case 'gross_profit':
                    const isIncome = item.type === 'income';
                    return (
                        <tr key={item.id || idx} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-4 text-gray-500">{formatDate(item.date)}</td>
                            <td className="px-6 py-4">{item.description}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.type?.toUpperCase()}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                            </td>
                        </tr>
                    );
                default: return null;
            }
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {titles[type] || 'Report'}
                    </h1>
                </div>

                <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase font-medium">
                                {renderHeaders()}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">Loading...</td>
                                    </tr>
                                ) : (
                                    renderRows()
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BusinessVerificationReport;
