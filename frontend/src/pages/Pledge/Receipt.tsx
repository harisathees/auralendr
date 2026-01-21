import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader } from 'react-icons/fi';
import { FaIdCard } from 'react-icons/fa';
import bg1 from '/assets/auralendr/front.png';
import bg2 from '/assets/auralendr/back.jpg';
import GoldCoinSpinner from '../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner';
import { getPledge } from '../../api/pledgeService';
import api from '../../api/apiClient';

// Helper Icons
// Helper Icons removed as they were unused in the active code logic
// If needed, restore CheckIcon/CrossIcon here

// Date formatter
const formatDate = (isoDateString: string) => {
    if (!isoDateString) return 'N/A';
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const DynamicReceipt = React.lazy(() => import('./components/DynamicReceipt'));
const A4ReceiptSheet = React.lazy(() => import('./components/A4ReceiptSheet'));

const Receipt = () => {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<any>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    const [sharingTarget, setSharingTarget] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestRates = async () => {
            try {
                const { data } = await api.get('/api/metal-rates');
                const rates = Array.isArray(data) ? data : (data.data || []);
                const goldRate = rates.find((r: any) => r.metal_type === "Gold")?.rate || 0;
                const silverRate = rates.find((r: any) => r.metal_type === "Silver")?.rate || 0;
                return { goldRate, silverRate };
            } catch (err) {
                console.error("Rate fetch error", err);
                return { goldRate: 0, silverRate: 0 };
            }
        };

        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/api/receipt-templates');
                // The API returns an array, so we need to find the active one
                if (Array.isArray(data)) {
                    return data.find((t: any) => t.status === 'active') || data[0] || null;
                }
                return data;
            } catch (error) {
                console.error("Failed to load receipt config", error);
                return null;
            }
        };

        const fetchData = async () => {
            if (!id) return;

            try {
                const [pledgeResponse, rates, configData, brandResponse] = await Promise.all([
                    getPledge(id),
                    fetchLatestRates(),
                    fetchConfig(),
                    api.get('/api/brand-settings').catch(() => ({ data: {} }))
                ]);

                setConfig(configData);

                const pledge = pledgeResponse.data.data || pledgeResponse.data;
                const customer = pledge.customer;
                const loan = pledge.loan;
                const jewel = Array.isArray(pledge.jewels) ? pledge.jewels[0] : pledge.jewel; // Handle single/multi jewel

                // Brand Data
                const brand = brandResponse.data;

                // Media Handling (New Service)
                const mediaFiles = pledge.media || [];
                const customerMedia = mediaFiles.find((m: any) => m.category === 'customer_image');
                const jewelMedia = mediaFiles.find((m: any) => m.category === 'jewel_image');

                // Helper to fix potential localhost port issues if present in API response
                const fixUrl = (url: string | null) => {
                    if (!url) return null;
                    if (url.startsWith('http://localhost/') && !url.includes(':8000')) {
                        return url.replace('http://localhost/', 'http://localhost:8000/');
                    }
                    return url;
                };

                const customerImageUrl = fixUrl(customerMedia?.url) || customer?.customer_image_url || customer?.photo_url || null;
                const jewelImageUrl = fixUrl(jewelMedia?.url) || jewel?.image_url || null;

                setData({
                    // Legacy flattened data (keep for backward compatibility if needed)
                    name: customer?.name || 'N/A',
                    address: customer?.address || 'N/A',
                    phone: customer?.mobile_no || 'N/A',
                    whatsapp: customer?.whatsapp_no || '',
                    date: formatDate(loan?.date), // loan might be null in some edge cases?
                    duedate: formatDate(loan?.due_date),
                    weight: jewel?.gross_weight || jewel?.net_weight || 0,
                    interest: loan?.interest_rate,
                    interestTaken: loan?.interest_taken === 1 || loan?.interest_taken === true,
                    jewelName: jewel?.description || jewel?.jewel_name || 'N/A',
                    faults: jewel?.faults || 'N/A',
                    quality: jewel?.quality || 'N/A',
                    count: jewel?.quantity || jewel?.pieces || 1,
                    itemNo: loan?.loan_no,
                    amount: loan?.amount,
                    customerImage: customerImageUrl,
                    jewelImage: jewelImageUrl,
                    goldRate: loan?.gold_rate ?? rates.goldRate,
                    silverRate: loan?.silver_rate ?? rates.silverRate,
                    ID: customer?.id_proof_number || customer?.id_proof || 'N/A',


                    // NEW: Raw nested data for DynamicReceipt
                    pledge: pledge,
                    customer: customer,
                    loan: loan,
                    jewels: pledge.jewels,
                    brand: brand, // Pass brand settings

                    // Pass specific media objects for secure loading
                    customerMedia: customerMedia,
                    jewelMedia: jewelMedia
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load pledge data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Pre-load images to Data URLs to avoid CORS/Fetch issues in html-to-image
    const [loadedImages, setLoadedImages] = useState({
        bg1: '',
        bg2: '',
        customer: '',
        jewel: ''
    });

    useEffect(() => {
        if (!data) return;

        const loadToDataUrl = async (url: string | null): Promise<string> => {
            if (!url) return '';
            try {
                // Determine if we need to use the authenticated API client or standard fetch
                // If the URL is our secure API endpoint (starts with /api), use 'api' client to send auth headers.
                // If it's a static asset (like bg1), use standard fetch.

                let blob: Blob;

                if (url.startsWith('/api/')) {
                    // Use axios instance which has the interceptors for Auth Token
                    const response = await api.get(url, { responseType: 'blob' });
                    blob = response.data;
                } else {
                    // Static asset or external URL
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                    blob = await response.blob();
                }

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error("Failed to load image:", url, e);
                return '';
            }
        };

        // Helper to get Secure URL or fallback
        const getSecureUrl = (mediaObj: any, fallbackUrl: string | null) => {
            if (mediaObj && mediaObj.id) {
                // Use the secure backend endpoint which validates auth and serves the file
                // We don't need a full URL here if we are using our axios/fetch relative to API
                // But since we use fetch() in loadToDataUrl, we need to be careful with base URL.
                // However, loadToDataUrl uses the 'api' client approach or we construct full URL.
                // Ideally, we just return the endpoint path.
                return `/api/media/${mediaObj.id}/stream`;
            }
            return fallbackUrl;
        };

        const loadAll = async () => {
            // Prioritize MediaService objects from data
            const cUrl = getSecureUrl(data.customerMedia, data.customerImage);
            const jUrl = getSecureUrl(data.jewelMedia, data.jewelImage);

            // Backgrounds are static assets (public folder), so they are fine as is.
            // Customer/Jewel images need the secure stream if they are from MediaService.

            const [b1, b2, c, j] = await Promise.all([
                loadToDataUrl(bg1),
                loadToDataUrl(bg2),
                loadToDataUrl(cUrl),
                loadToDataUrl(jUrl)
            ]);
            setLoadedImages({ bg1: b1, bg2: b2, customer: c, jewel: j });
        };

        loadAll();
    }, [data]);

    const handleShare = async (ref: React.RefObject<HTMLDivElement | null>, filename: string, target: string) => {
        setSharingTarget(target);
        try {
            if (!ref.current) return;

            const scale = 3;
            const dataUrl = await htmlToImage.toPng(ref.current, {
                quality: 1,
                pixelRatio: scale,
                cacheBust: false,
                skipFonts: true, // Attempt to skip font embedding to avoid CORS issues
                filter: (node) => {
                    // Filter out external stylesheets if they cause issues
                    if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                        return false;
                    }
                    return true;
                }
            });

            // Generate blob and file regardless of platform
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], filename, { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Loan Notice",
                    text: "Please find the notice attached",
                });
            } else {
                // Fallback: Try Copy to Clipboard
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert("Image copied to clipboard!");
                } catch (err) {
                    console.error("Clipboard failed", err);
                    // Final Fallback: Download
                    const link = document.createElement("a");
                    link.download = filename;
                    link.href = dataUrl;
                    link.click();
                }
            }
        } catch (error) {
            console.error("Error handling share/print:", error);
        } finally {
            setSharingTarget(null);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <GoldCoinSpinner text="Loading pledge data..." />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
                {error || "Loan not found"}
            </div>
        )
    }

    // Check if configuration exists and has layout_config (New Type) OR type='dynamic' (Old Type)
    // We treat everything as dynamic if it has layout_config or explicitly set type
    if (config?.layout_config || config?.type === 'dynamic') {
        const [viewMode, setViewMode] = React.useState<'single' | 'a4'>('single');
        const [showDuplicates, setShowDuplicates] = React.useState(true);

        return (
            <div className="min-h-screen bg-slate-900 py-8">
                {/* Tab Navigation */}
                <div className="max-w-4xl mx-auto px-4 mb-6">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-2 flex gap-2 border border-white/20">
                        <button
                            onClick={() => setViewMode('single')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${viewMode === 'single'
                                ? 'bg-blue-600 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Single Receipt
                        </button>
                        <button
                            onClick={() => setViewMode('a4')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${viewMode === 'a4'
                                ? 'bg-blue-600 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            A4 Sheet Layout
                        </button>
                    </div>

                    {/* Duplicate Toggle (only visible in A4 mode) */}
                    {viewMode === 'a4' && (
                        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <label className="flex items-center gap-3 text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showDuplicates}
                                    onChange={(e) => setShowDuplicates(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="font-medium">Show Duplicate Copies (4 per sheet)</span>
                            </label>
                            <p className="text-white/60 text-sm mt-2 ml-8">
                                {showDuplicates
                                    ? 'Printing 2 office copies + 2 customer copies per sheet'
                                    : 'Printing 1 office copy + 1 customer copy per sheet'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Render based on view mode */}
                <React.Suspense fallback={<div className="flex items-center justify-center p-20 text-white">Loading template...</div>}>
                    {viewMode === 'single' ? (
                        <DynamicReceipt data={data} config={config} />
                    ) : (
                        <A4ReceiptSheet data={data} config={config} showDuplicates={showDuplicates} />
                    )}
                </React.Suspense>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 overflow-y-auto overflow-x-hidden py-8 font-sans print:bg-white print:p-0">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between print:hidden">
                <h1 className="text-white font-bold text-lg hidden sm:block">Receipt Preview</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => handleShare(frontRef, 'notice-front.png', 'front')}
                        disabled={sharingTarget !== null}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-wait"
                    >
                        {sharingTarget === 'front' ? (
                            <>
                                <FiLoader className="animate-spin" />
                                <span>Sharing...</span>
                            </>
                        ) : (
                            <>
                                <FiShare2 size={16} />
                                <span>Front</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => handleShare(backRef, 'notice-back.png', 'back')}
                        disabled={sharingTarget !== null}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-wait"
                    >
                        {sharingTarget === 'back' ? (
                            <>
                                <FiLoader className="animate-spin" />
                                <span>Sharing...</span>
                            </>
                        ) : (
                            <>
                                <FiShare2 size={16} />
                                <span>Back</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-4 print:mt-0 print:block">
                {/* Front */}
                <div className="relative w-full flex justify-center print:block print:w-auto print:h-auto h-[119mm] sm:h-[179mm] md:h-[238mm] lg:h-[297mm] transition-[height] duration-300">
                    <div className="a4-wrapper origin-top print:transform-none transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-300">
                        <div
                            ref={frontRef}
                            className="bg-white shadow-2xl print:shadow-none relative"
                            style={{
                                width: '210mm',
                                height: '297mm',
                                overflow: 'hidden'
                            }}
                        >
                            <img src={loadedImages.bg1 || bg1} crossOrigin="anonymous" alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm', pointerEvents: 'none' }} />

                            {data.customerImage && loadedImages.customer && (
                                <div style={{
                                    position: 'absolute', top: '90mm', left: '70mm', width: '26mm', height: '33mm',
                                    transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                                    border: '2px solid black', zIndex: 1,
                                    backgroundColor: '#eee'
                                }}>
                                    <img
                                        src={loadedImages.customer}
                                        crossOrigin="anonymous"
                                        alt="Customer"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e: any) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                            {data.jewelImage && loadedImages.jewel && (
                                <div style={{
                                    position: 'absolute', top: '120mm', left: '179mm', width: '26mm', height: '33mm',
                                    transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                                    border: '2px solid black', zIndex: 1,
                                    backgroundColor: '#eee'
                                }}>
                                    <img
                                        src={loadedImages.jewel}
                                        crossOrigin="anonymous"
                                        alt="Jewel"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e: any) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}

                            {/* Duplicate images logic/Office Copy */}
                            {data.customerImage && loadedImages.customer && (
                                <div style={{
                                    position: 'absolute', top: '91mm', left: '179mm', width: '26mm', height: '33mm',
                                    transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                                    border: '2px solid black', zIndex: 1,
                                    backgroundColor: '#eee'
                                }}>
                                    <img
                                        src={loadedImages.customer}
                                        crossOrigin="anonymous"
                                        alt="Customer"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e: any) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                            {data.jewelImage && loadedImages.jewel && (
                                <div style={{
                                    position: 'absolute', top: '119mm', left: '70mm', width: '26mm', height: '33mm',
                                    transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                                    border: '2px solid black', zIndex: 1,
                                    backgroundColor: '#eee'
                                }}>
                                    <img
                                        src={loadedImages.jewel}
                                        crossOrigin="anonymous"
                                        alt="Jewel"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e: any) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}

                            {fields(data).map((field, index) => (
                                <div key={index} style={{
                                    position: 'absolute',
                                    top: field.top, left: field.left,
                                    transform: 'rotate(90deg)', transformOrigin: 'left top',
                                    fontSize: '15px', zIndex: 1, whiteSpace: 'nowrap',
                                    overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150mm',
                                    fontFamily: 'sans-serif', fontWeight: 'bold'
                                }}>
                                    {field.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div className="relative w-full flex justify-center print:block print:w-auto print:page-break-before-always print:h-auto h-[119mm] sm:h-[179mm] md:h-[238mm] lg:h-[297mm] transition-[height] duration-300">
                    <div className="a4-wrapper origin-top print:transform-none transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-300">
                        <div
                            ref={backRef}
                            className="bg-white shadow-2xl print:shadow-none"
                            style={{
                                width: '210mm',
                                height: '297mm',
                                overflow: 'hidden'
                            }}
                        >
                            <img src={loadedImages.bg2 || bg2} crossOrigin="anonymous" alt="back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Dynamic Height Spacer for scroll area adjustment based on scale if needed, usually wrapper handles it via flex/margin */}
            <div className="h-24 sm:h-0"></div>
        </div>
    );
};

const fields = (data: any) => {
    const monthlyInterest = data.interest > 0 ? (data.amount * data.interest) / 100 : 0;
    return [
        //office copy
        { top: '100.5mm', left: '201mm', label: `Date:${data.date}` },
        { top: '100.5mm', left: '196mm', label: `Due :${data.duedate}` },
        { top: '100.5mm', left: '188mm', label: `G:${data.goldRate}` },
        { top: '121.5mm', left: '188mm', label: `S:${data.silverRate}` },
        { top: '2.5mm', left: '187mm', label: `Rate/g: ₹${(data.weight > 0 ? (data.amount / data.weight).toFixed(2) : '0.0')}` },

        { top: '2.5mm', left: '179mm', label: `கடன் எண்:${data.itemNo}` },
        { top: '2.5mm', left: '172mm', label: `தரம்:${data.quality}` },
        { top: '2.5mm', left: '165mm', label: `Pcs: ${data.count}` },
        { top: '2.5mm', left: '158mm', label: `வட்டி: ${data.interest}% (₹${monthlyInterest.toFixed(0)}/M)` },
        { top: '2.5mm', left: '151mm', label: `Faults: ${data.faults}` },
        { top: '2.5mm', left: '144mm', label: `பொருள்: ${data.jewelName}` },
        { top: '2.5mm', left: '137mm', label: `முகவரி: ${data.address}` },
        { top: '45mm', left: '179mm', label: `பெயர்: ${data.name}` },
        { top: '45mm', left: '172mm', label: `தொகை: ₹${data.amount}/-` },
        { top: '45mm', left: '165mm', label: `எடை: ${data.weight}g` },
        { top: '45mm', left: '158mm', label: ` ${data.phone},${data.whatsapp}` },
        { top: '92mm', left: '146mm', label: (<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaIdCard />{data.ID?.replace(/\D/g, '') || 'N/A'}</span>), },
        { top: '44mm', left: '187mm', label: `${data.interestTaken ? '✅வ.பெ' : '❌வ.எவி'}` },


        //customer copy
        { top: '100.5mm', left: '95mm', label: `Date:${data.date}` },
        { top: '100.5mm', left: '90mm', label: `Due :${data.duedate}` },
        { top: '2.5mm', left: '80mm', label: `Rate/g: ₹${(data.weight > 0 ? (data.amount / data.weight).toFixed(2) : '0.0')}` },
        { top: '2.5mm', left: '63mm', label: `கடன் எண்:${data.itemNo}` },
        { top: '2.5mm', left: '56mm', label: `Pcs: ${data.count}` },
        { top: '2.5mm', left: '49mm', label: `வட்டி: ${data.interest}%(₹${monthlyInterest.toFixed(0)}/M)` },
        { top: '2.5mm', left: '42mm', label: `பொருள்: ${data.jewelName}` },
        { top: '2.5mm', left: '35mm', label: `Faults: ${data.faults}` },
        { top: '45mm', left: '70mm', label: `பெயர்: ${data.name}` },
        { top: '45mm', left: '63mm', label: `தொகை: ₹${data.amount}/-` },
        { top: '45mm', left: '56mm', label: `எடை: ${data.weight}g` },
        { top: '95.5mm', left: '85mm', label: ` ${data.phone},${data.whatsapp}` },
        { top: '90mm', left: '36mm', label: (<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaIdCard />{data.ID?.replace(/\D/g, '') || 'N/A'}</span>), },
        { top: '2.5mm', left: '70mm', label: `${data.interestTaken ? '✅வ.பெ' : '❌வ.எவி'}` },

    ];
};

export default Receipt;
