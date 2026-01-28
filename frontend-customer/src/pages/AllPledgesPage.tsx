import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Calendar, IndianRupee, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface PledgeSummary {
    id: number;
    loan_no: string;
    amount: number;
    date: string;
    status: string;
    tracking_code: string;
}

interface AllPledgesResponse {
    status: string;
    customer_name: string;
    data: PledgeSummary[];
}

export default function AllPledgesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pledges, setPledges] = useState<PledgeSummary[]>([]);
    const [customerName, setCustomerName] = useState<string>('');

    // Expecting tracking_code and last_4_digits from location state
    const { tracking_code, last_4_digits } = location.state || {};

    useEffect(() => {
        if (!tracking_code || !last_4_digits) {
            navigate('/');
            return;
        }

        const fetchPledges = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customer/all-pledges/${tracking_code}?last_4_digits=${last_4_digits}`);
                const data: AllPledgesResponse = await response.json();

                if (response.ok && data.status === 'success') {
                    setPledges(data.data);
                    setCustomerName(data.customer_name);
                } else {
                    toast.error('Failed to load pledges');
                    navigate('/'); // Or handle error gracefully
                }
            } catch (error) {
                console.error('Error fetching pledges:', error);
                toast.error('An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPledges();
    }, [tracking_code, last_4_digits, navigate]);

    const handleCardClick = (pledgeTrackingCode: string) => {
        // Navigate to verify page -> which then redirects to view if valid.
        // OR better yet, since we are already authenticated via "last_4_digits" context,
        // we could directly go to view loan page if we had the loan details.
        // But the ViewLoanPage expects data state.
        // We can call the 'track' API to get the new loan data, then navigate.
        // Re-using the logic manually here:

        setLoading(true); // briefly show loading
        fetch(`${import.meta.env.VITE_API_URL}/api/customer/track/${pledgeTrackingCode}?last_4_digits=${last_4_digits}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    navigate('/view', { state: { data: data.data, last_4_digits: last_4_digits } });
                } else {
                    toast.error('Could not load loan details');
                }
            })
            .catch(() => toast.error('Check network connection'))
            .finally(() => setLoading(false));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">My Pledges</h1>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Welcome, {customerName}</p>
                        </div>
                    </div>
                    {/* Add any future filters or counters here, nicely stacked */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium px-1">
                        Total Pledges: {pledges.length}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pledges.map((pledge) => (
                        <div
                            key={pledge.id}
                            onClick={() => handleCardClick(pledge.tracking_code)}
                            className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pledge.status === 'active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {pledge.status.toUpperCase()}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold">{pledge.loan_no}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4 text-gray-400" />
                                    <span className="text-lg font-bold">₹{Number(pledge.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(pledge.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
