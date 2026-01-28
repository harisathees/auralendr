import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Calendar, IndianRupee, Activity, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TimelineEvent {
    status: string;
    message: string;
    date: string;
}

interface LoanData {
    tracking_code: string;
    current_status: string;
    loan_date: string;
    loan_no: string;
    amount: string;
    timeline: TimelineEvent[];
}

export default function ViewLoanPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const loanData = location.state?.data as LoanData | undefined;
    const last_4_digits = location.state?.last_4_digits as string | undefined;

    useEffect(() => {
        if (!loanData) {
            navigate('/');
        }
    }, [loanData, navigate]);

    if (!loanData) return null;

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 p-3 md:p-6 lg:p-8 flex justify-center items-start">

            {/* Main Card */}
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">

                {/* Header Section */}
                <div className="bg-blue-600 p-5 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                        {/* Back Button - Mobile: Absolute top-left, Desktop: Inline/Hidden logic if needed, but here we just put it left */}
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute left-0 top-0 md:static p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors md:hidden"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        {/* Title Section */}
                        <div className="text-center md:text-left w-full mt-8 md:mt-0">
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">Loan Status</h1>
                            <p className="opacity-90 text-sm md:text-base font-medium tracking-wide">
                                Tracking ID: {loanData.tracking_code}
                            </p>
                        </div>

                        {/* Action Button - Absolute on mobile top right, normal on desktop */}
                        <button
                            onClick={() => navigate('/pledges', { state: { tracking_code: loanData.tracking_code, last_4_digits } })}
                            className="absolute right-0 top-0 md:static px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            <span>All Loans</span>
                        </button>
                    </div>
                </div>

                <div className="p-5 md:p-10">

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                        {/* Item 1 */}
                        <div className="flex flex-col items-start sm:items-center text-left sm:text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent dark:bg-gray-800/50 sm:dark:bg-transparent">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5" /> Loan No
                            </p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-base md:text-lg">
                                {loanData.loan_no}
                            </p>
                        </div>

                        {/* Item 2 */}
                        <div className="flex flex-col items-start sm:items-center text-left sm:text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent dark:bg-gray-800/50 sm:dark:bg-transparent">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                                <Calendar className="w-3.5 h-3.5" /> Date
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-base md:text-lg">
                                {new Date(loanData.loan_date).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Item 3 */}
                        <div className="flex flex-col items-start sm:items-center text-left sm:text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent dark:bg-gray-800/50 sm:dark:bg-transparent">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                                <IndianRupee className="w-3.5 h-3.5" /> Amount
                            </p>
                            <p className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white">
                                ₹{Number(loanData.amount).toLocaleString()}
                            </p>
                        </div>

                        {/* Item 4 */}
                        <div className="flex flex-col items-start sm:items-center text-left sm:text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent dark:bg-gray-800/50 sm:dark:bg-transparent">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                                <Activity className="w-3.5 h-3.5" /> Status
                            </p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-1 ${loanData.current_status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                {loanData.current_status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8 text-left md:text-center pl-1">
                        Processing History
                    </h3>

                    <div className="relative pl-2 md:pl-0">
                        {/* Vertical Line: Left on mobile, Center on Desktop */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 md:translate-x-[-1px]"></div>

                        <div className="space-y-8">
                            {loanData.timeline.map((event, idx) => {
                                const isEven = idx % 2 === 0;

                                return (
                                    <div key={idx} className={`relative flex items-start md:items-center md:justify-between ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}>

                                        {/* Timeline Dot */}
                                        <div className="absolute left-6 md:left-1/2 -translate-x-1/2 mt-1 md:mt-0 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-white dark:border-gray-900 bg-blue-500 text-white z-10 shadow-md">
                                            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                                        </div>

                                        {/* Content Block */}
                                        <div className={`ml-14 md:ml-0 w-full md:w-[calc(50%-2rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm transition-transform hover:scale-[1.01] ${isEven ? 'md:mr-auto' : 'md:ml-auto'
                                            }`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                                                    {event.status}
                                                </span>
                                                <time className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded self-start sm:self-auto">
                                                    {new Date(event.date).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </time>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed">
                                                {event.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}