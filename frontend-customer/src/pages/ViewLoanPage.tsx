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

    useEffect(() => {
        if (!loanData) {
            navigate('/');
        }
    }, [loanData, navigate]);

    if (!loanData) return null;

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 p-4 md:p-8 flex justify-center items-start">
            
            {/* Main Card - Max width grows on larger screens */}
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                
                {/* Header Section */}
                <div className="bg-blue-600 p-6 md:p-8 text-center text-white relative">
                    <button 
                        onClick={() => navigate(-1)}
                        className="absolute left-6 top-6 p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors md:hidden"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl md:text-3xl font-bold mb-2">Loan Status</h1>
                    <p className="opacity-90 text-sm md:text-base font-medium tracking-wide">
                        Tracking ID: {loanData.tracking_code}
                    </p>
                </div>

                <div className="p-6 md:p-10">
                    
                    {/* Details Grid: 2 cols on mobile, 4 cols on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                        {/* Item 1 */}
                        <div className="flex flex-col justify-center md:items-center text-left md:text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center md:justify-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5" /> Loan No
                            </p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base truncate w-full">
                                {loanData.loan_no}
                            </p>
                        </div>

                        {/* Item 2 */}
                        <div className="flex flex-col justify-center md:items-center text-right md:text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center justify-end md:justify-center gap-1 mb-1">
                                <Calendar className="w-3.5 h-3.5" /> Date
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm md:text-base">
                                {new Date(loanData.loan_date).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Item 3 */}
                        <div className="flex flex-col justify-center md:items-center text-left md:text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center md:justify-center gap-1 mb-1">
                                <IndianRupee className="w-3.5 h-3.5" /> Amount
                            </p>
                            <p className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">
                                ₹{Number(loanData.amount).toLocaleString()}
                            </p>
                        </div>

                        {/* Item 4 */}
                        <div className="flex flex-col justify-center md:items-center text-right md:text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider flex items-center justify-end md:justify-center gap-1 mb-1">
                                <Activity className="w-3.5 h-3.5" /> Status
                            </p>
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold md:mt-1 ${
                                loanData.current_status === 'active' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {loanData.current_status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8 text-center md:text-left">
                        Processing History
                    </h3>

                    <div className="relative">
                        {/* Vertical Line: Left on mobile, Center on Desktop */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 md:translate-x-[-1px]"></div>

                        <div className="space-y-8">
                            {loanData.timeline.map((event, idx) => {
                                // Logic to determine alternating sides on desktop
                                const isEven = idx % 2 === 0;
                                
                                return (
                                    <div key={idx} className={`relative flex items-center md:justify-between ${
                                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}>
                                        
                                        {/* Timeline Dot */}
                                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 bg-blue-500 text-white z-10 shadow-md">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>

                                        {/* Content Block */}
                                        {/* Mobile: Always Right with left margin */}
                                        {/* Desktop: Alternates width 5/12 (approx 42%) */}
                                        <div className={`ml-12 md:ml-0 w-full md:w-[calc(50%-2rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm transition-transform hover:scale-[1.01] ${
                                            isEven ? 'md:mr-auto' : 'md:ml-auto'
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