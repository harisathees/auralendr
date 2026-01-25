import React, { useRef, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader, FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';

// Define Interface matching ReceiptTemplateNew
interface ReceiptField {
    id: string;
    type: 'text' | 'image' | 'line' | 'barcode' | 'qr';
    label: string;
    dataKey: string;
    x: number; // mm
    y: number; // mm
    width: number; // mm
    height?: number; // mm
    fontSize?: number; // pt
    fontWeight?: 'normal' | 'bold' | 'medium' | 'black';
    align?: 'left' | 'center' | 'right';
    visible: boolean;
    side?: 'front' | 'back';
    copyType?: 'office' | 'customer';
}

interface A4ReceiptSheetProps {
    data: any;
    config: {
        papersize?: { width: number; height: number; unit: string };
        orientation?: 'portrait' | 'landscape';
        layout_config?: ReceiptField[] | { fields: ReceiptField[] };
    };
    showDuplicates?: boolean;
    layoutMode?: 'single' | 'a4_2x2' | 'a4_4up';
}

const formatDate = (isoDateString: string) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const A4ReceiptSheet: React.FC<A4ReceiptSheetProps> = ({ data, config, showDuplicates = true, layoutMode }) => {
    const effectiveMode = layoutMode || (showDuplicates ? 'a4_4up' : 'a4_2x2');
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = React.useState(false);

    // Consolidated Data Resolver
    const resolvedData = useMemo(() => {
        const d = data || {};
        const p = d.pledge || {};
        const l = d.loan || p.loan || {};
        const c = d.customer || p.customer || {};
        const j = Array.isArray(d.jewels) ? d.jewels : (p.jewels || []);
        const b = d.brand || {};

        return {
            receipt: {
                date: new Date().toLocaleDateString('en-GB'),
                no: l.loan_no || p.reference_no || 'N/A',
                tracking_url: d.qrCode || '',
            },
            brand: {
                name: b.brand_name || 'Brand Name',
                address: b.brand_address || '',
                mobile: b.brand_mobile || '',
                email: b.brand_email || '',
                logo: b.brand_logo_url || null,
            },
            pledge: {
                no: l.loan_no || p.reference_no || 'N/A',
                amount: l.amount || 0,
                date: formatDate(l.date),
                due_date: formatDate(l.due_date),
                interest_rate: l.interest_percentage || 0,
                scheme_interest_rate: l.interest_percentage || 0,
                item_count: j.length || (j[0]?.quantity) || 1,
                total_weight: j.reduce((acc: number, item: any) => acc + (parseFloat(item.gross_weight || item.weight || 0)), 0).toFixed(2),
                items_description: j.map((item: any) => item.description || item.jewel_name || item.name).join(', '),
                jewel_image: j[0]?.image_url || null,
            },
            customer: {
                name: c.name || 'N/A',
                mobile: c.mobile_no || '',
                address: c.address || '',
                id_proof: c.id_proof_number || '',
                image: c.customer_image_url || c.photo_url || null,
            }
        };
    }, [data]);

    // Helper to get value from dot notation string
    const getValue = (path: string) => {
        if (!path) return '';
        const keys = path.split('.');
        let val: any = resolvedData;
        for (const key of keys) {
            val = val ? val[key] : undefined;
        }
        return val;
    };

    const handlePrint = useReactToPrint({
        contentRef: frontRef as any, // Type assertion to fix ref compatibility
        documentTitle: `Receipt-A4-${resolvedData.pledge.no}`,
        onAfterPrint: () => { console.log('Print finished'); }
    });

    const handleShare = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
        if (!ref.current) return;
        setSharing(true);
        try {
            const dataUrl = await htmlToImage.toPng(ref.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: 'white'
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], filename, { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Receipt",
                    text: `Receipt for Pledge ${resolvedData.pledge.no}`,
                });
            } else {
                const link = document.createElement("a");
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Sharing failed", error);
        } finally {
            setSharing(false);
        }
    };

    // Get paper dimensions from config
    const paperSize = config.papersize || { width: 105, height: 148, unit: 'mm' };
    const orientation = config.orientation || 'portrait';

    // Calculate actual dimensions based on orientation
    let receiptWidth = paperSize.width;
    let receiptHeight = paperSize.height;

    if (orientation === 'landscape') {
        [receiptWidth, receiptHeight] = [receiptHeight, receiptWidth];
    }

    // A4 dimensions
    const A4_WIDTH = 210; // mm
    const A4_HEIGHT = 297; // mm

    // Calculate positioning for 2x2 grid
    const horizontalGap = (A4_WIDTH - (receiptWidth * 2)) / 3;
    const verticalGap = (A4_HEIGHT - (receiptHeight * 2)) / 3;

    const positions = {
        topLeft: { x: horizontalGap, y: verticalGap },
        topRight: { x: horizontalGap * 2 + receiptWidth, y: verticalGap },
        bottomLeft: { x: horizontalGap, y: verticalGap * 2 + receiptHeight },
        bottomRight: { x: horizontalGap * 2 + receiptWidth, y: verticalGap * 2 + receiptHeight },
    };

    const fieldsRaw = config.layout_config;
    // Handle both array and object wrapper
    const fields: ReceiptField[] = Array.isArray(fieldsRaw)
        ? fieldsRaw
        : (fieldsRaw && 'fields' in fieldsRaw ? (fieldsRaw as any).fields : []);

    // Render a single receipt copy
    const renderReceipt = (copyType: 'office' | 'customer', side: 'front' | 'back', position: { x: number; y: number }) => {
        const filteredFields = fields.filter(f =>
            f.visible &&
            f.side === side &&
            f.copyType === copyType &&
            !(copyType === 'office' && f.type === 'qr')
        );

        return (
            <div
                key={`${copyType}-${side}`}
                style={{
                    position: 'absolute',
                    left: `${position.x}mm`,
                    top: `${position.y}mm`,
                    width: `${receiptWidth}mm`,
                    height: `${receiptHeight}mm`,
                    border: '1px dashed #ccc',
                    overflow: 'hidden'
                }}
            >
                {filteredFields.map((field) => {
                    const value = field.dataKey ? getValue(field.dataKey) : field.label;

                    const style: React.CSSProperties = {
                        position: 'absolute',
                        left: `${field.x}mm`,
                        top: `${field.y}mm`,
                        width: `${field.width}mm`,
                        textAlign: field.align || 'left',
                        fontSize: `${field.fontSize || 12}pt`,
                        fontWeight: field.fontWeight || 'normal',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.2,
                        zIndex: 10,
                    };

                    if (field.type === 'image') {
                        const imgSrc = field.dataKey ? getValue(field.dataKey) : field.label;
                        if (!imgSrc) return null;

                        return (
                            <img
                                key={field.id}
                                src={imgSrc}
                                alt={field.label}
                                style={{
                                    ...style,
                                    height: `${field.height}mm`,
                                    objectFit: 'contain'
                                }}
                            />
                        );
                    } else if (field.type === 'qr') {
                        const value = field.dataKey ? getValue(field.dataKey) : field.label;
                        if (!value) return null;
                        return (
                            <div key={field.id} style={style}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: String(value) }}
                                    style={{ width: '100%', height: '100%' }}
                                    className="[&>svg]:w-full [&>svg]:h-full"
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div key={field.id} style={style}>
                                {value !== undefined && value !== null ? String(value) : ''}
                            </div>
                        );
                    }
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 py-8 flex flex-col items-center gap-4">
            {/* Header / Actions */}
            <div className="w-full max-w-4xl bg-white/10 backdrop-blur rounded-xl p-4 flex justify-between items-center text-white border border-white/20 print:hidden">
                <div>
                    <span className="font-bold text-lg">A4 Sheet Layout</span>
                    <span className="text-sm opacity-60 ml-2">
                        ({receiptWidth}×{receiptHeight}mm × {effectiveMode === 'single' ? '1' : effectiveMode === 'a4_4up' ? '4' : '2'} copies)
                    </span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handlePrint()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium">
                        <FiPrinter /> Print
                    </button>
                    <button onClick={() => handleShare(frontRef, `Receipt-Front-${resolvedData.pledge.no}.png`)} disabled={sharing} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50">
                        {sharing ? <FiLoader className="animate-spin" /> : <FiShare2 />} Front
                    </button>
                    <button onClick={() => handleShare(backRef, `Receipt-Back-${resolvedData.pledge.no}.png`)} disabled={sharing} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50">
                        {sharing ? <FiLoader className="animate-spin" /> : <FiShare2 />} Back
                    </button>
                </div>
            </div>

            {/* Front Page */}
            <div className="overflow-auto max-w-full p-4">
                <div
                    ref={frontRef}
                    className="bg-white relative shadow-2xl print:shadow-none mx-auto"
                    style={{
                        width: `${A4_WIDTH}mm`,
                        height: `${A4_HEIGHT}mm`,
                        position: 'relative',
                    }}
                >
                    {/* Top Left: Office Copy #1 (Always shown if not explicitly single custom logic, usually basically always) */}
                    {renderReceipt('office', 'front', positions.topLeft)}

                    {/* Top Right: Office Copy #2 (4up) OR Customer Copy #1 (2up Side-by-Side) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('office', 'front', positions.topRight)}
                    {effectiveMode === 'a4_2x2' && renderReceipt('customer', 'front', positions.topRight)}

                    {/* Bottom Left: Customer Copy #1 (Only in 4up) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('customer', 'front', positions.bottomLeft)}

                    {/* Bottom Right: Customer Copy #2 (Only in 4up) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('customer', 'front', positions.bottomRight)}
                </div>
            </div>

            {/* Back Page */}
            <div className="overflow-auto max-w-full p-4 print:page-break-before-always">
                <div
                    ref={backRef}
                    className="bg-white relative shadow-2xl print:shadow-none mx-auto"
                    style={{
                        width: `${A4_WIDTH}mm`,
                        height: `${A4_HEIGHT}mm`,
                        position: 'relative',
                    }}
                >
                    {/* Top Left: Office Copy #1 Back */}
                    {renderReceipt('office', 'back', positions.topLeft)}

                    {/* Top Right: Office Copy #2 Back (4up) OR Customer Copy #1 Back (2up Side-by-Side) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('office', 'back', positions.topRight)}
                    {effectiveMode === 'a4_2x2' && renderReceipt('customer', 'back', positions.topRight)}

                    {/* Bottom Left: Customer Copy #1 Back (Only in 4up) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('customer', 'back', positions.bottomLeft)}

                    {/* Bottom Right: Customer Copy #2 Back (Only in 4up) */}
                    {effectiveMode === 'a4_4up' && renderReceipt('customer', 'back', positions.bottomRight)}
                </div>
            </div>
        </div>
    );
};

export default A4ReceiptSheet;
