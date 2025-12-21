import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader } from 'react-icons/fi';
import { FaIdCard } from 'react-icons/fa';
import bg1 from '../../assets/front.jpg';
import bg2 from '../../assets/back.jpg';
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

const Receipt = () => {
    const { id } = useParams(); // changed from loanId to id to match typical route param
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    const [sharingTarget, setSharingTarget] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestRates = async () => {
            try {
                // Assuming API endpoint for metal rates exists, otherwise defaulting
                const { data } = await api.get('/metal-rates');
                // Check if data is array or object wrapped in data
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
                    getPledge(Number(id)),
                    fetchLatestRates()
                ]);

                const loan = pledgeResponse.data.data || pledgeResponse.data;
                const customer = loan.customer;
                // Assuming 'jewel' is singular or taking the first one if it's a list
                // Adjust based on your API response structure. 
                // If loan has 'jewels' array:
                const jewel = Array.isArray(loan.jewels) ? loan.jewels[0] : loan.jewel;

                // Construct image URLs
                // Ensure backend sends full URLs or prepend base URL
                const customerImageUrl = customer?.customer_image_url || customer?.photo_url || null;
                // Jewel image might be in jewel object
                const jewelImageUrl = jewel?.image_url || null;

                setData({
                    name: customer?.name || 'N/A',
                    address: customer?.address || 'N/A',
                    phone: customer?.mobile_no || 'N/A',
                    whatsapp: customer?.whatsapp_no || '',
                    date: formatDate(loan.date),
                    duedate: formatDate(loan.due_date), // check API field name (duedate vs due_date)
                    weight: jewel?.gross_weight || jewel?.net_weight || 0, // check API field name
                    interest: loan.interest_rate,
                    interestTaken: loan.interest_taken === 1 || loan.interest_taken === true, // normalize boolean
                    jewelName: jewel?.description || jewel?.jewel_name || 'N/A',
                    faults: jewel?.faults || 'N/A',
                    quality: jewel?.quality || 'N/A',
                    count: jewel?.quantity || jewel?.pieces || 1,
                    itemNo: loan.loan_no,
                    amount: loan.amount,
                    customerImage: customerImageUrl,
                    jewelImage: jewelImageUrl,
                    goldRate: loan.gold_rate ?? rates.goldRate,
                    silverRate: loan.silver_rate ?? rates.silverRate,
                    ID: customer?.id_proof_number || customer?.id_proof || 'N/A',
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

    const handleShare = async (ref: React.RefObject<HTMLDivElement | null>, filename: string, target: string) => {
        setSharingTarget(target);
        try {
            if (!ref.current) return;

            const scale = 3;
            const dataUrl = await htmlToImage.toPng(ref.current, {
                quality: 1,
                pixelRatio: scale,
                cacheBust: true,
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

    return (
        <>
            <div className="flex justify-center gap-5 my-5 print:hidden">
                <button
                    onClick={() => handleShare(frontRef, 'notice-front.png', 'front')}
                    disabled={sharingTarget !== null}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-wait"
                >
                    {sharingTarget === 'front' ? (
                        <>
                            <FiLoader className="animate-spin" />
                            <span>Sharing...</span>
                        </>
                    ) : (
                        <>
                            <FiShare2 size={16} />
                            <span>Share Front Page</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleShare(backRef, 'notice-back.png', 'back')}
                    disabled={sharingTarget !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-wait"
                >
                    {sharingTarget === 'back' ? (
                        <>
                            <FiLoader className="animate-spin" />
                            <span>Sharing...</span>
                        </>
                    ) : (
                        <>
                            <FiShare2 size={16} />
                            <span>Share Back Page</span>
                        </>
                    )}
                </button>
            </div>


            {/* Front */}
            <div
                ref={frontRef}
                style={{ position: 'relative', width: '210mm', height: '297mm', margin: '0 auto', overflow: 'hidden', background: 'white' }}
            >
                <img src={bg1} alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm' }} />


                {data.customerImage && (
                    <div style={{
                        position: 'absolute', top: '90mm', left: '70mm', width: '26mm', height: '33mm',
                        transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                        border: '2px solid black', zIndex: 1,
                        backgroundColor: '#eee'
                    }}>
                        <img
                            src={data.customerImage}
                            alt="Customer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => e.target.style.display = 'none'}
                        />
                    </div>
                )}
                {data.jewelImage && (
                    <div style={{
                        position: 'absolute', top: '120mm', left: '179mm', width: '26mm', height: '33mm',
                        transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                        border: '2px solid black', zIndex: 1,
                        backgroundColor: '#eee'
                    }}>
                        <img
                            src={data.jewelImage}
                            alt="Jewel"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* Duplicate images logic from user code? It seems duplicates were for office/customer copies probably. */}
                {data.customerImage && (
                    <div style={{
                        position: 'absolute', top: '91mm', left: '179mm', width: '26mm', height: '33mm',
                        transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                        border: '2px solid black', zIndex: 1,
                        backgroundColor: '#eee'
                    }}>
                        <img
                            src={data.customerImage}
                            alt="Customer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => e.target.style.display = 'none'}
                        />
                    </div>
                )}
                {data.jewelImage && (
                    <div style={{
                        position: 'absolute', top: '119mm', left: '70mm', width: '26mm', height: '33mm',
                        transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
                        border: '2px solid black', zIndex: 1,
                        backgroundColor: '#eee'
                    }}>
                        <img
                            src={data.jewelImage}
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
                        fontFamily: 'sans-serif'
                    }}>
                        <b>{field.label}</b>
                    </div>
                ))}
            </div>

            {/* Back */}
            <div ref={backRef} style={{ width: '210mm', height: '297mm', margin: '0 auto', pageBreakBefore: 'always' }}>
                <img src={bg2} alt="back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        </>
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
