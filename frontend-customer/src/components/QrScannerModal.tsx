import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';

interface QrScannerModalProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export default function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Scan QR Code</h3>
                    <p className="text-gray-500 text-sm mb-6">Align the QR code on your receipt within the frame.</p>

                    <div className="rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 aspect-square bg-black">
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    // result is an array in recent versions, or object. 
                                    // Check type safety or just take first rawValue
                                    const rawValue = result[0]?.rawValue;
                                    if (rawValue) onScan(rawValue);
                                }
                            }}
                            components={{
                                finder: true,
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
