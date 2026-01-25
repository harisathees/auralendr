import React, { useRef, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader, FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';


// Define Interface matching ReceiptTemplateNew
interface ReceiptField {
    id: string;
    type: 'text' | 'image' | 'line' | 'barcode' | 'qr';
    label: string; // Display label for editor, or static text content
    dataKey: string; // e.g., 'pledge.no'
    x: number; // mm
    y: number; // mm
    width: number; // mm
    height: number; // mm (for images/lines)
    fontSize?: number; // pt
    fontWeight?: 'normal' | 'bold' | 'medium' | 'black';
    align?: 'left' | 'center' | 'right';
    visible: boolean;
}

interface DynamicReceiptProps {
    data: any; // Contains { pledge, customer, loan, jewels, brand, ...anything else }
    config: {
        paper_size?: "A4" | "A5" | "A6" | "A6 Landscape" | "Thermal";
        papersize?: { width: number; height: number; unit: string }; // New format
        layout_config?: ReceiptField[] | { fields: ReceiptField[] }; // Updated to support nested object
        // Legacy props fallback
        size?: string;
        type?: string;
        orientation?: string;
    };
}

const formatDate = (isoDateString: string) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const DynamicReceipt: React.FC<DynamicReceiptProps> = ({ data, config }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = React.useState(false);

    // Consolidated Data Resolver
    const resolvedData = useMemo(() => {
        const d = data || {};
        const p = d.pledge || {}; // Raw pledge object if passed
        const l = d.loan || p.loan || {};
        const c = d.customer || p.customer || {};
        const j = Array.isArray(d.jewels) ? d.jewels : (p.jewels || []);
        const b = d.brand || {}; // Expecting brand settings object

        return {
            receipt: {
                date: new Date().toLocaleDateString('en-GB'), // Today's date for receipt printing
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
                scheme_interest_rate: l.interest_percentage || 0, // Fallback as scheme relation is missing
                item_count: j.length || (j[0]?.quantity) || 1, // Simple count
                total_weight: j.reduce((acc: number, item: any) => acc + (parseFloat(item.gross_weight || item.weight || 0)), 0).toFixed(2),
                items_description: j.map((item: any) => item.description || item.jewel_name || item.name).join(', '),
                jewel_image: j[0]?.image_url || null, // Primary jewel image
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
        contentRef: componentRef,
        documentTitle: `Receipt-${resolvedData.pledge.no}`,
        onAfterPrint: () => { console.log('Print finished'); }
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
            const file = new File([blob], `Receipt-${resolvedData.pledge.no}.png`, { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Receipt",
                    text: `Receipt for Pledge ${resolvedData.pledge.no}`,
                });
            } else {
                const link = document.createElement("a");
                link.download = `Receipt-${resolvedData.pledge.no}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Sharing failed", error);
        } finally {
            setSharing(false);
        }
    };

    // Determine Paper Dimensions
    const getPaperDimensions = () => {
        // New format: config.papersize is an object
        if (config.papersize && typeof config.papersize === 'object') {
            const { width, height, unit } = config.papersize as any;
            return {
                width: `${width}${unit}`,
                height: orientation === 'landscape' ? `${Math.min(width, height)}${unit}` : 'auto', // For height, we usually let contents flow unless fixed
                minHeight: orientation === 'landscape' ? `${Math.min(width, height)}${unit}` : `${Math.max(width, height)}${unit}`
            };
        }

        // Legacy string format
        const paperSize = config.paper_size || config.size || 'A4';
        switch (paperSize) {
            case 'A4': return { width: '210mm', minHeight: '297mm', height: 'auto' };
            case 'A5': return { width: '148mm', minHeight: '210mm', height: 'auto' };
            case 'A6': return { width: '105mm', minHeight: '148mm', height: 'auto' };
            case 'A6 Landscape': return { width: '148mm', minHeight: '105mm', height: '105mm' };
            case 'Thermal': return { width: '80mm', minHeight: 'auto', height: 'auto' };
            default: return { width: '210mm', minHeight: '297mm', height: 'auto' };
        }
    }

    const orientation = config.orientation || 'portrait';
    const { width, height, minHeight } = getPaperDimensions();
    const paperSizeDisplayName = config.paper_size || (config.papersize ? `${config.papersize.width}${config.papersize.unit} x ${config.papersize.height}${config.papersize.unit}` : 'Custom Size');

    const fieldsRaw = config.layout_config;
    // Handle both array and object wrapper
    const fields: ReceiptField[] = Array.isArray(fieldsRaw)
        ? fieldsRaw
        : (fieldsRaw && 'fields' in fieldsRaw ? (fieldsRaw as any).fields : []);

    if (fields.length === 0) {
        return <div className="p-10 text-center text-red-500">No layout configuration found for this template.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 py-8 flex flex-col items-center gap-4">
            {/* Header / Actions */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur rounded-xl p-4 flex justify-between items-center text-white border border-white/20 print:hidden">
                <div>
                    <span className="font-bold text-lg">{paperSizeDisplayName} Receipt</span>
                    <span className="text-sm opacity-60 ml-2">({fields.length} fields)</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handlePrint()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium">
                        <FiPrinter /> Print
                    </button>
                    <button onClick={handleShare} disabled={sharing} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50">
                        {sharing ? <FiLoader className="animate-spin" /> : <FiShare2 />} Share
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="overflow-auto max-w-full p-4">
                <div
                    ref={componentRef}
                    className="bg-white relative shadow-2xl print:shadow-none mx-auto"
                    style={{
                        width: width,
                        height: height === 'auto' ? undefined : height,
                        minHeight: minHeight,
                        position: 'relative',
                        overflow: 'hidden' // Clip content outside standard size
                    }}
                >
                    {/* Render Fields */}
                    {fields.map((field) => {
                        if (!field.visible) return null;

                        const value = field.dataKey ? getValue(field.dataKey) : field.label; // If dataKey exists, resolve it, else show label (static text)

                        // Style object
                        const style: React.CSSProperties = {
                            position: 'absolute',
                            left: `${field.x}mm`,
                            top: `${field.y}mm`,
                            width: `${field.width}mm`,
                            textAlign: field.align || 'left',
                            fontSize: `${field.fontSize || 12}pt`,
                            fontWeight: field.fontWeight || 'normal',
                            whiteSpace: 'pre-wrap', // Allow wrapping
                            lineHeight: 1.2,
                            zIndex: 10,
                        };

                        if (field.type === 'image') {
                            // Value acts as Image URL
                            const imgSrc = field.dataKey ? getValue(field.dataKey) : field.label; // Label stores custom URL if static
                            if (!imgSrc) return null; // Don't render empty images

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
                            // Text Field
                            // If it's a static label (no dataKey), just show label content.
                            // If it has dataKey, show resolved value.

                            return (
                                <div key={field.id} style={style}>
                                    {value !== undefined && value !== null ? String(value) : ''}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

export default DynamicReceipt;
