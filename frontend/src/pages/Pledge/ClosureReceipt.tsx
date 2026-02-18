import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader } from 'react-icons/fi';
import { FaIdCard } from 'react-icons/fa';

import bg1 from '/assets/auralendr/front.png';
import bg2 from '/assets/auralendr/back.jpg';
import GoldCoinSpinner from '../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner';
import { getPledge } from '../../api/pledgeService';
import api from '../../api/apiClient';

// Date formatter
const formatDate = (isoDateString: string) => {
    if (!isoDateString) return 'N/A';
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const ClosureReceipt = () => {
    const location = useLocation();

    const id = location.state?.id || useParams().id;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sharingTarget, setSharingTarget] = useState<string | null>(null);

    const frontRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLatestRates = async () => {
            try {
                const { data } = await api.get('/metal-rates');
                const rates = Array.isArray(data) ? data : (data.data || []);
                const goldRate = rates.find((r: any) => r.metal_type === "Gold")?.rate || 0;
                const silverRate = rates.find((r: any) => r.metal_type === "Silver")?.rate || 0;
                return { goldRate, silverRate };
            } catch (err) {
                console.error("Rate fetch error", err);
                return { goldRate: 0, silverRate: 0 };
            }
        };

        const fetchData = async () => {
            if (!id) return;

            try {
                const [pledgeResponse, rates] = await Promise.all([
                    getPledge(id),
                    fetchLatestRates()
                ]);

                const pledge = pledgeResponse.data.data || pledgeResponse.data;
                const customer = pledge.customer;
                const loan = pledge.loan;
                const jewel = Array.isArray(pledge.jewels) ? pledge.jewels[0] : pledge.jewel;
                const closure = pledge.closure; // Get closure details

                // Media Handling
                const mediaFiles = pledge.media || [];
                const customerMedia = mediaFiles.find((m: any) => m.category === 'customer_image');
                const jewelMedia = mediaFiles.find((m: any) => m.category === 'jewel_image');

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
                    name: customer?.name || 'N/A',
                    address: customer?.address || 'N/A',
                    phone: customer?.mobile_no || 'N/A',
                    whatsapp: customer?.whatsapp_no || '',
                    date: formatDate(loan?.date),
                    closedDate: closure ? formatDate(closure.closed_date) : 'N/A', // Closure Date
                    weight: jewel?.gross_weight || jewel?.net_weight || 0,
                    interest: loan?.interest_rate,
                    interestTaken: loan?.interest_taken === 1 || loan?.interest_taken === true,
                    jewelName: jewel?.description || jewel?.jewel_name || 'N/A',
                    faults: jewel?.faults || 'N/A',
                    quality: jewel?.quality || 'N/A',
                    count: jewel?.quantity || jewel?.pieces || 1,
                    itemNo: loan?.loan_no,
                    amount: loan?.amount,
                    finalAmount: closure?.total_payable || loan?.amount, // Amount paid on closure
                    customerImage: customerImageUrl,
                    jewelImage: jewelImageUrl,
                    goldRate: loan?.gold_rate ?? rates.goldRate,
                    silverRate: loan?.silver_rate ?? rates.silverRate,
                    ID: customer?.id_proof_number || customer?.id_proof || 'N/A',
                    qrCode: loan?.qr_code || null,
                    customerMedia: customerMedia, // Added
                    jewelMedia: jewelMedia // Added
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
                let blob: Blob;
                if (url.startsWith('/media/')) {
                    const response = await api.get(url, { responseType: 'blob' });
                    blob = response.data;
                } else {
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


        const getSecureUrl = (mediaObj: any, fallbackUrl: string | null) => {
            if (mediaObj && mediaObj.id) {
                return `/media/${mediaObj.id}/stream`;
            }
            return fallbackUrl;
        };

        const loadAll = async () => {
            const cUrl = getSecureUrl(data.customerMedia, data.customerImage);
            const jUrl = getSecureUrl(data.jewelMedia, data.jewelImage);

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
                skipFonts: true,
                filter: (node) => {
                    if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                        return false;
                    }
                    return true;
                }
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], filename, { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Pledge Closure Receipt",
                    text: "Please find the closure receipt attached",
                });
            } else {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert("Image copied to clipboard!");
                } catch (err) {
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

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><GoldCoinSpinner text="Loading receipt..." /></div>;
    if (error || !data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error || "Data not found"}</div>;

    return (
        <div className="min-h-screen bg-slate-900 overflow-y-auto overflow-x-hidden py-8 font-sans print:bg-white print:p-0">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between print:hidden">
                <h1 className="text-white font-bold text-lg hidden sm:block">Closure Receipt</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => handleShare(frontRef, 'closure-receipt.png', 'front')}
                        disabled={sharingTarget !== null}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        {sharingTarget === 'front' ? <FiLoader className="animate-spin" /> : <FiShare2 />}
                        Share Receipt
                    </button>
                </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-4 print:mt-0 print:block">
                <div className="relative w-full flex justify-center print:block print:w-auto h-[119mm] sm:h-[179mm] md:h-[238mm] lg:h-[297mm] transition-[height] duration-300">
                    <div className="a4-wrapper origin-top print:transform-none transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-transform duration-300">
                        <div
                            ref={frontRef}
                            className="bg-white shadow-2xl print:shadow-none relative"
                            style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}
                        >
                            <img src={loadedImages.bg1 || bg1} crossOrigin="anonymous" alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm', pointerEvents: 'none' }} />

                            {/* Badge indicating Closed */}
                            <div style={{
                                position: 'absolute', top: '130mm', left: '100mm',
                                transform: 'translate(-50%, -50%) rotate(-30deg)',
                                fontSize: '100px', fontWeight: 'bold', color: 'rgba(220, 38, 38, 0.2)',
                                border: '10px solid rgba(220, 38, 38, 0.2)', padding: '20px', borderRadius: '20px',
                                pointerEvents: 'none', zIndex: 0
                            }}>
                                CLOSED
                            </div>

                            {/* Images */}
                            {data.customerImage && loadedImages.customer && (
                                <div style={{ position: 'absolute', top: '90mm', left: '70mm', width: '26mm', height: '33mm', transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden', border: '2px solid black', zIndex: 1, backgroundColor: '#eee' }}>
                                    <img src={loadedImages.customer} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            {data.jewelImage && loadedImages.jewel && (
                                <div style={{ position: 'absolute', top: '120mm', left: '179mm', width: '26mm', height: '33mm', transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden', border: '2px solid black', zIndex: 1, backgroundColor: '#eee' }}>
                                    <img src={loadedImages.jewel} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}

                            {/* Duplicate Images */}
                            {data.customerImage && loadedImages.customer && (
                                <div style={{ position: 'absolute', top: '91mm', left: '179mm', width: '26mm', height: '33mm', transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden', border: '2px solid black', zIndex: 1, backgroundColor: '#eee' }}>
                                    <img src={loadedImages.customer} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            {data.jewelImage && loadedImages.jewel && (
                                <div style={{ position: 'absolute', top: '119mm', left: '70mm', width: '26mm', height: '33mm', transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden', border: '2px solid black', zIndex: 1, backgroundColor: '#eee' }}>
                                    <img src={loadedImages.jewel} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}

                            {/* Fields */}
                            {fields(data).map((field, index) => (
                                <div key={index} style={{
                                    position: 'absolute', top: field.top, left: field.left,
                                    transform: 'rotate(90deg)', transformOrigin: 'left top',
                                    fontSize: '15px', zIndex: 1, whiteSpace: 'nowrap',
                                    overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150mm',
                                    fontFamily: 'sans-serif', fontWeight: 'bold'
                                }}>
                                    {field.label}
                                </div>
                            ))}

                            {/* QR Code */}
                            {data.qrCode && (
                                <div style={{ position: 'absolute', top: '100mm', left: '18mm', width: '15mm', height: '15mm', transform: 'rotate(90deg)', transformOrigin: 'left top', zIndex: 1 }}>
                                    <div dangerouslySetInnerHTML={{ __html: data.qrCode }} style={{ width: '100%', height: '100%' }} className="[&>svg]:w-full [&>svg]:h-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24 sm:h-0"></div>
        </div>
    );
};

const fields = (data: any) => {
    const monthlyInterest = data.interest > 0 ? (data.amount * data.interest) / 100 : 0;
    return [
        { top: '100.5mm', left: '201mm', label: `Loan Date:${data.date}` },
        { top: '100.5mm', left: '196mm', label: `Closed:${data.closedDate}` }, // Modified
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
        { top: '100.5mm', left: '95mm', label: `Loan Date:${data.date}` },
        { top: '100.5mm', left: '90mm', label: `Closed:${data.closedDate}` }, // Modified
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

export default ClosureReceipt;
