import React, { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader, FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';

interface DynamicReceiptProps {
    data: any;
    config: {
        size: "A4" | "A5" | "A6" | "A6 Landscape" | "Thermal";
        alignment: "left" | "center" | "right";
        title: string;
        header: string;
        footer: string;
        show_logo: boolean;
    };
}

const DynamicReceipt: React.FC<DynamicReceiptProps> = ({ data, config }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = React.useState(false);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Receipt-${data.itemNo}`,
    });

    const handleShare = async () => {
        if (!componentRef.current) return;
        setSharing(true);
        try {
            const dataUrl = await htmlToImage.toPng(componentRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: 'white'
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `Receipt-${data.itemNo}.png`, { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Receipt",
                    text: `Receipt for Pledge ${data.itemNo}`,
                });
            } else {
                // Fallback: Download
                const link = document.createElement("a");
                link.download = `Receipt-${data.itemNo}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Sharing failed", error);
        } finally {
            setSharing(false);
        }
    };

    // Calculate width based on size
    const getWidth = () => {
        switch (config.size) {
            case 'A4': return '210mm';
            case 'A5': return '148mm';
            case 'A6': return '105mm';
            case 'A6 Landscape': return '148mm';
            case 'Thermal': return '80mm';
            default: return '210mm';
        }
    };

    const getMinHeight = () => {
        switch (config.size) {
            case 'A4': return '297mm';
            case 'A5': return '210mm';
            case 'A6': return '148mm';
            case 'A6 Landscape': return '105mm';
            case 'Thermal': return 'auto';
            default: return '297mm';
        }
    };

    const containerStyle: React.CSSProperties = {
        width: getWidth(),
        minHeight: getMinHeight(),
        padding: config.size === 'Thermal' ? '10px' : '20px',
        margin: '0 auto',
        backgroundColor: 'white',
        textAlign: config.alignment,
        fontSize: config.size === 'Thermal' ? '12px' : '14px',
        color: 'black',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <div className="min-h-screen bg-slate-900 py-8 flex flex-col items-center gap-4">
            {/* Action Bar */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur rounded-xl p-4 flex justify-between items-center text-white border border-white/20">
                <div>
                    <span className="font-bold text-lg">{config.size} Receipt</span>
                    <span className="text-sm opacity-60 ml-2">({config.alignment})</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <FiPrinter /> Print
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={sharing}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                    >
                        {sharing ? <FiLoader className="animate-spin" /> : <FiShare2 />}
                        Share
                    </button>
                </div>
            </div>

            {/* Receipt Preview/Canvas */}
            <div className="shadow-2xl overflow-auto max-w-full">
                <div ref={componentRef} style={containerStyle} className="print:shadow-none bg-white">
                    {/* Header */}
                    <div className="mb-6 border-b-2 border-black pb-4">
                        {config.show_logo && <div className="mb-2 font-bold text-xl">[LOGO]</div>}
                        <h1 className="text-xl font-bold uppercase mb-1">{config.title}</h1>
                        <div className="whitespace-pre-wrap opacity-80 text-sm">{config.header}</div>
                    </div>

                    {/* Main Content Area */}
                    {config.size !== 'A6 Landscape' ? (
                        <>
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-left mb-6 text-sm">
                                <div>
                                    <p><span className="font-bold">Date:</span> {data.date}</p>
                                    <p><span className="font-bold">Pledge No:</span> {data.itemNo}</p>
                                </div>
                                <div className="text-right">
                                    <p><span className="font-bold">Due Date:</span> {data.duedate}</p>
                                    <p><span className="font-bold">Customer ID:</span> {data.ID}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6 text-left border p-2 rounded border-black/10">
                                <p className="font-bold border-b border-black/10 mb-1 pb-1">Customer Details</p>
                                <p className="font-bold text-lg">{data.name}</p>
                                <p>{data.address}</p>
                                <p>{data.phone} {data.whatsapp && `, ${data.whatsapp}`}</p>
                            </div>

                            {/* Item Details Table/List */}
                            <div className="flex-1">
                                <table className="w-full text-left mb-6 text-sm">
                                    <thead className="border-b-2 border-black">
                                        <tr>
                                            <th className="py-1">Description</th>
                                            <th className="py-1 text-right">Qty/Gross</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/10">
                                        <tr>
                                            <td className="py-2">
                                                <div className="font-bold">{data.jewelName}</div>
                                                <div className="text-xs opacity-70">
                                                    {data.quality} | {data.faults !== 'N/A' && `Faults: ${data.faults}`}
                                                </div>
                                            </td>
                                            <td className="py-2 text-right">
                                                <div>{data.count} pcs</div>
                                                <div>{data.weight} g</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="flex justify-between items-center border-t-2 border-black pt-2 font-bold text-lg">
                                    <span>Loan Amount</span>
                                    <span>₹{data.amount}/-</span>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-1 opacity-70">
                                    <span>Interest Rate: {data.interest}% / month</span>
                                    <span>{data.interestTaken ? 'Prepaid Interest' : 'Postpaid Interest'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 min-h-[50mm] flex items-center justify-center border border-dashed border-gray-300 m-8 text-gray-400 text-sm">
                            {/* Empty Content for A6 Landscape */}
                            Content Area (Blank)
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-black text-center text-xs">
                        <div className="whitespace-pre-wrap mb-4">{config.footer}</div>
                        <p className="opacity-50">Generated by AuraLendr</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicReceipt;
