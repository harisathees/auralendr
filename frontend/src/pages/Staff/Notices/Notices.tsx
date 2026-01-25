import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/apiClient';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { FiSearch, FiPrinter, FiFileText, FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight, FiShare2, FiClock, FiCalendar } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';

// Import Notice Components
import OverdueNotice from '../../../components/Notice/OverdueNotice/OverdueNotice';
import AnnualNotice from '../../../components/Notice/AnnualNotice/AnnualNotice';

import type { Pledge, Jewel } from '../../../types/models';

const ITEMS_PER_PAGE = 9;

export default function Notices() {
    const [reportType, setReportType] = useState<'overdue' | 'annual' | null>(null);
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [noticeData, setNoticeData] = useState<any | null>(null);
    const singlePrintRef = useRef<HTMLDivElement>(null);
    const bulkPrintRef = useRef<HTMLDivElement>(null);
    const [showBulkPreview, setShowBulkPreview] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const navigate = useNavigate();

    const fetchPledges = async (type: 'overdue' | 'annual') => {
        setLoading(true);
        try {
            const response = await api.get(`/pledges`, {
                params: {
                    report_type: type,
                    per_page: 1000,
                }
            });
            const data = response.data.data || [];
            setPledges(data);
        } catch (error) {
            console.error("Error fetching pledges:", error);
            setPledges([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectReport = (type: 'overdue' | 'annual') => {
        setReportType(type);
        fetchPledges(type);
    };

    const filteredPledges = useMemo(() => {
        return pledges.filter(pledge => {
            const s = search.toLowerCase();
            const customerName = pledge.customer?.name?.toLowerCase() || '';
            const mobile = pledge.customer?.mobile_no || '';
            const loanNo = pledge.loan?.loan_no?.toLowerCase() || '';

            const searchMatch = s === '' ||
                customerName.includes(s) ||
                mobile.includes(s) ||
                loanNo.includes(s);

            let dateMatch = true;
            if (startDate && endDate && pledge.loan?.due_date) {
                const targetDate = new Date(pledge.loan.due_date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                targetDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                dateMatch = targetDate >= start && targetDate <= end;
            }
            return searchMatch && dateMatch;
        }).sort((a, b) => {
            const dateA = new Date(a.loan?.due_date || 0).getTime();
            const dateB = new Date(b.loan?.due_date || 0).getTime();
            return dateA - dateB;
        });
    }, [pledges, search, startDate, endDate]);

    const paginatedPledges = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPledges.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPledges, currentPage]);

    const totalPages = Math.ceil(filteredPledges.length / ITEMS_PER_PAGE);

    useEffect(() => { setCurrentPage(1); }, [filteredPledges.length]);

    const handleShareAllAsPdf = async () => {
        if (!bulkPrintRef.current) return;
        setIsGeneratingPdf(true);
        const cloneContainer = document.createElement('div');
        cloneContainer.style.position = 'absolute';
        cloneContainer.style.left = '-9999px';
        cloneContainer.style.top = '0px';
        document.body.appendChild(cloneContainer);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const originalNotices = bulkPrintRef.current.querySelectorAll('.a4-container');

            const limit = Math.min(originalNotices.length, 50);

            for (let i = 0; i < limit; i++) {
                const originalNotice = originalNotices[i] as HTMLElement;
                const clone = originalNotice.cloneNode(true) as HTMLElement;
                clone.style.zoom = '1';
                clone.style.transform = 'scale(1)';
                clone.style.width = '210mm';
                clone.style.height = '297mm';
                clone.style.background = 'white';
                clone.style.margin = '0';

                cloneContainer.appendChild(clone);

                const canvas = await html2canvas(clone, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                const imageData = canvas.toDataURL('image/jpeg', 0.8);

                if (i > 0) pdf.addPage();
                pdf.addImage(imageData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

                cloneContainer.removeChild(clone);
            }

            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], 'Loan-Notices.pdf', { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({ files: [pdfFile], title: 'Loan Notices' });
            } else {
                pdf.save('Loan-Notices.pdf');
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error creating PDF.");
        } finally {
            document.body.removeChild(cloneContainer);
            setIsGeneratingPdf(false);
        }
    };

    const handleShare = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
        if (!ref.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(ref.current, { quality: 0.95, pixelRatio: 2, backgroundColor: '#fff' });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], filename, { type: "image/png" });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: "Loan Notice" });
                    return;
                }
            }

            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(`<html><head><title>${filename}</title><style>@page { size: A4 portrait; margin: 0; } body { margin: 0; display: flex; justify-content: center; } img { width: 100%; max-width: 210mm; height: auto; }</style></head><body><img src="${dataUrl}" /></body></html>`);
                doc.close();
                iframe.contentWindow?.addEventListener('load', () => {
                    iframe.contentWindow?.print();
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 1000);
                });
            }

        } catch (error) {
            console.error("Error sharing:", error);
            alert("Could not generate notice image.");
        }
    };

    const openNoticePreview = (pledge: Pledge) => {
        let jewelName = 'N/A';
        let count = 0;
        if (pledge.jewels && pledge.jewels.length > 0) {
            jewelName = pledge.jewels.map((j: Jewel) => j.description).join(', ');
            count = pledge.jewels.reduce((total: number, j: Jewel) => total + (Number(j.pieces) || 0), 0);
        }

        setNoticeData({
            name: pledge.customer.name || '',
            address: pledge.customer.address || '',
            phone: pledge.customer.mobile_no || '',
            date: new Date().toLocaleDateString('en-GB'),
            jewelName: jewelName,
            count: count,
            itemNo: pledge.loan?.loan_no || '',
            itemDate: pledge.loan ? new Date(pledge.loan.date).toLocaleDateString('en-GB') : '',
            amount: pledge.loan ? Number(pledge.loan.amount).toLocaleString('en-IN') : '0',
            validity_months: pledge.loan?.validity_months ? Number(pledge.loan.validity_months) : 6,
        });
    };

    if (!reportType) {
        return (
            <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans">
                <header className="mb-6 pb-4 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
                        <FiFileText className="text-indigo-600" />
                        <span>Notices</span>
                    </h1>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-red-500/50 cursor-pointer"
                        onClick={() => handleSelectReport('annual')}>
                        <div className="flex-shrink-0 bg-red-100 rounded-full p-4">
                            <FiCalendar className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Annual Due Notices</h3>
                            <p className="text-slate-500 text-sm">Print notices for loans older than one year.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-yellow-500/50 cursor-pointer"
                        onClick={() => handleSelectReport('overdue')}>
                        <div className="flex-shrink-0 bg-yellow-100 rounded-full p-4">
                            <FiClock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Overdue Notices</h3>
                            <p className="text-slate-500 text-sm">Print notices for loans past their due date.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans pb-24">
            <header className="mb-6 pb-4 border-b border-slate-200">
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setReportType(null)} className="p-2 rounded-full hover:bg-slate-200 transition">
                            <FaArrowLeft className="text-slate-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {reportType === 'annual' ? 'Annual Due Loans' : 'Overdue Loans'}
                        </h1>
                    </div>
                    {!loading && (
                        <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                            {filteredPledges.length} Loans Found
                        </span>
                    )}
                </div>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search name, phone, or loan no..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setShowBulkPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        <FiPrinter size={16} />
                        <span>Print All Notices</span>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (<div className="text-center py-20"><FiLoader className="mx-auto animate-spin text-4xl text-indigo-500" /></div>)
                    : filteredPledges.length === 0 ? (<div className="text-center bg-white p-10 rounded-lg shadow-sm"><FiAlertCircle className="mx-auto text-4xl text-amber-500 mb-2" /> No matching loans found.</div>)
                        : (
                            <>
                                {paginatedPledges.map((pledge) => (
                                    <div key={pledge.id} className="bg-white rounded-xl shadow-sm p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/pledges/${pledge.id}`)}>
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                                                    {pledge.customer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{pledge.customer.name || 'N/A'}</p>
                                                    <p className="text-sm text-slate-500">{pledge.customer.mobile_no || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4 sm:mt-0 sm:justify-end sm:gap-6">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs text-slate-500">Loan No.</p>
                                                    <p className="font-medium font-mono text-slate-700 text-sm">{pledge.loan?.loan_no || '—'}</p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs text-red-500 font-semibold">Due Date</p>
                                                    <p className="font-semibold text-red-600 text-sm">
                                                        {pledge.loan?.due_date ? new Date(pledge.loan.due_date).toLocaleDateString('en-GB') : 'N/A'}
                                                    </p>
                                                </div>
                                                <button onClick={() => openNoticePreview(pledge)} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition">
                                                    Print Notice
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="py-4 flex items-center justify-between">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition"><FiChevronLeft size={16} /> Previous</button>
                                        <span className="text-sm font-semibold text-slate-500">Page {currentPage} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition">Next <FiChevronRight size={16} /></button>
                                    </div>
                                )}
                            </>
                        )}
            </div>

            {noticeData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-3 sm:p-6 rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[80vh] flex flex-col">
                        <h3 className="text-lg font-bold mb-2 flex-shrink-0">Notice Preview</h3>
                        <div className="flex-grow bg-slate-300 overflow-y-auto p-1 sm:p-8 rounded-b-lg">
                            <div className="transform origin-top flex justify-center pb-8">
                                <div className="scale-[0.6] sm:scale-75 origin-top shadow-lg">
                                    {reportType === 'annual' ? (
                                        <AnnualNotice ref={singlePrintRef} {...noticeData} />
                                    ) : (
                                        <OverdueNotice ref={singlePrintRef} {...noticeData} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-4 mt-6 flex-shrink-0">
                            <button onClick={() => setNoticeData(null)} className="text-sm font-semibold text-slate-600">Cancel</button>
                            <button
                                onClick={() => handleShare(singlePrintRef, `Notice-${noticeData.itemNo}.png`)}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
                            >
                                <FiShare2 size={16} /> Print / Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBulkPreview && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex flex-col z-50 p-4 sm:p-8">
                    <div className="flex-shrink-0 bg-white p-4 rounded-t-lg shadow-lg flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">All Preview</h3>
                            <p className="text-sm text-slate-500">Showing {filteredPledges.length} notices.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowBulkPreview(false)} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel</button>
                            <button
                                onClick={handleShareAllAsPdf}
                                disabled={isGeneratingPdf}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:bg-green-400"
                            >
                                {isGeneratingPdf ? (<><FiLoader className="animate-spin" /><span>Generating PDF...</span></>) : (<><FiShare2 size={16} /><span>Make PDF</span></>)}
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow bg-slate-300 overflow-y-auto p-1 sm:p-8 rounded-b-lg">
                        <div className="transform origin-top">
                            <div ref={bulkPrintRef} className="space-y-4">
                                {filteredPledges.map(pledge => {
                                    let jewelName = 'N/A'; let count = 0;
                                    if (pledge.jewels && pledge.jewels.length > 0) {
                                        jewelName = pledge.jewels.map((j: Jewel) => j.description).join(', ');
                                        count = pledge.jewels.reduce((total: number, j: Jewel) => total + (Number(j.pieces) || 0), 0);
                                    }
                                    const noticeProps = {
                                        name: pledge.customer.name || '', address: pledge.customer.address || '', phone: pledge.customer.mobile_no || '',
                                        date: new Date().toLocaleDateString('en-GB'), jewelName: jewelName, count: count,
                                        itemNo: pledge.loan?.loan_no || '',
                                        itemDate: pledge.loan ? new Date(pledge.loan.date).toLocaleDateString('en-GB') : '',
                                        amount: pledge.loan ? Number(pledge.loan.amount).toLocaleString('en-IN') : '0',
                                        validity_months: pledge.loan?.validity_months ? Number(pledge.loan.validity_months) : 6,
                                    };
                                    return (
                                        <div key={pledge.id} className="a4-container scale-[0.6] origin-left mb-[-30%] bg-white shadow-md">
                                            {reportType === 'annual' ? (
                                                <AnnualNotice {...noticeProps} />
                                            ) : (
                                                <OverdueNotice {...noticeProps} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
