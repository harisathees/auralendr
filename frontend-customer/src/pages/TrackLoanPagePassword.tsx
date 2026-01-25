import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { toast } from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

export default function TrackLoanPagePassword() {
    const location = useLocation();
    const navigate = useNavigate();
    // Get tracking code from state (passed from Redirect or HomePage)
    const trackingCode = location.state?.trackingCode;

    // Redirect if direct access without code
    useEffect(() => {
        if (!trackingCode) {
            navigate('/', { replace: true });
        }
    }, [trackingCode, navigate]);

    const [last4Digits, setLast4Digits] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');

    // Check validity on mount
    useEffect(() => {
        const checkValidity = async () => {
            try {
                await apiClient.get(`/customer/check/${trackingCode}`);
                setIsValid(true);
            } catch (err) {
                setIsValid(false);
                setError("Tracking Details Not Found");
            } finally {
                setIsValidating(false);
            }
        };
        if (trackingCode) checkValidity();
    }, [trackingCode]);

    // If validating, show loader
    if (isValidating) {
        return (
            <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If invalid, show error
    if (!isValid) {
        return (
            <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Invalid Tracking ID</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">The tracking code you entered does not exist or is no longer valid.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-bold">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (last4Digits.length !== 4) {
            toast.error("Please enter exactly 4 digits");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await apiClient.get(`/customer/track/${trackingCode}?last_4_digits=${last4Digits}`);
            const data = res.data.data;
            toast.success("Identity Verified");
            // Navigate to view page with data
            navigate('/view', { state: { data } });
        } catch (err: any) {
            console.error(err);
            setError("We could not find a loan record matching these details.");
            toast.error("Verification match failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-300">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Security Verify</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter the last 4 digits of your registered mobile number to access your loan details.</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="tel"
                            maxLength={4}
                            value={last4Digits}
                            onChange={(e) => setLast4Digits(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 4589"
                            className="w-full text-center text-3xl tracking-[1em] font-mono py-3 border-b-2 border-gray-300 focus:border-blue-500 bg-transparent outline-none transition-colors dark:text-white dark:border-gray-600"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || last4Digits.length !== 4}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30"
                    >
                        {loading ? 'Verifying...' : 'View Status'}
                    </button>
                </form>
            </div>
        </div>
    );
}
