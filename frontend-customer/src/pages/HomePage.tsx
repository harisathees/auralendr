import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, QrCode } from 'lucide-react';
import QrScannerModal from '../components/QrScannerModal';

const HomePage: React.FC = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const navigate = useNavigate();

    const handleScan = (data: string) => {
        if (!data) return;

        let code = data;
        // Try to extract code from URL if present (e.g., .../track/CODE)
        const match = data.match(/\/track\/([a-zA-Z0-9]+)/);
        if (match && match[1]) {
            code = match[1];
        } else {
            // Fallback: If it's a full URL but not matching our pattern, basic cleanup?
            // Assuming if it contains http, we might just want the last segment
            if (data.includes('http')) {
                const parts = data.split('/');
                code = parts[parts.length - 1];
            }
        }

        setShowScanner(false);
        navigate('/verify', { state: { trackingCode: code.trim() } });
    };

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingCode.trim()) {
            navigate('/verify', { state: { trackingCode: trackingCode.trim() } });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                        <Search className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2 font-display">Track Your Loan</h1>
                    <p className="text-slate-400">Enter your tracking ID or scan the QR code from your receipt.</p>
                </div>

                {/* Input Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1 mb-2 block">Tracking ID</label>
                            <input
                                type="text"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                                placeholder="e.g. TRK-12345678"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-mono tracking-wide"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!trackingCode.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Track Status <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center relative">
                        <span className="text-slate-500 text-sm px-3 relative bg-slate-800/50 z-10">OR</span>
                        <div className="absolute w-full h-px bg-slate-700/50 max-w-[200px]"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                    >
                        <QrCode className="w-5 h-5 text-blue-400" />
                        Scan QR Code
                    </button>
                </div>

                <p className="text-center text-slate-500 text-xs mt-8">
                    &copy; {new Date().getFullYear()} AuraLendr. Secure Customer Portal.
                </p>
            </motion.div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QrScannerModal
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default HomePage;
