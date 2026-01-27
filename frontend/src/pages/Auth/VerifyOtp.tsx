import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/apiClient';
import { Loader2, ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const itemsRef = useRef<Array<HTMLInputElement | null>>([]);

    // Countdown Timer (2 minutes)
    const [timeLeft, setTimeLeft] = useState(120);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/auth/forgot-password');
        }

        // Focus first input
        if (itemsRef.current[0]) {
            itemsRef.current[0]?.focus();
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleInputChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 5) {
            itemsRef.current[index + 1]?.focus();
        }

        // Auto submit if filled
        if (index === 5 && value) {
            const completeOtp = newOtp.join('');
            verifyOtp(completeOtp);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle Backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            itemsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length === 6 && data.every(char => !isNaN(Number(char)))) {
            setOtp(data);
            verifyOtp(data.join(''));
        }
    }

    const verifyOtp = async (code: string) => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { email, otp: code });
            navigate('/auth/reset-password', { state: { email, otp: code } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setTimeLeft(120);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            itemsRef.current[0]?.focus();
        } catch (err: any) {
            setError('Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verify it's you
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { itemsRef.current[index] = el }}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-800 text-center">
                                {error}
                            </div>
                        )}

                        <div className="text-center">
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="text-sm font-medium text-primary hover:text-primary/90"
                                >
                                    Resend Code
                                </button>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Resend code in {formatTime(timeLeft)}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => verifyOtp(otp.join(''))}
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Verify Code <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
