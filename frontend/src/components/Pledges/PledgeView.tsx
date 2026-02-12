import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SecureAudio from "../Shared/AudioAndImageFetch/SecureAudio";
import SecureImage from "../Shared/AudioAndImageFetch/SecureImage";
import CommunicationButtons from "../Shared/WhatsappAndSms/CommunicationButtons";
import api from "../../api/apiClient";

// --- Helper Components ---

interface ReadOnlyFieldProps {
  label: string;
  value: string | number | null | undefined;
  isTextArea?: boolean;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value, isTextArea = false }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{label}</span>
    <div className={`w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 text-sm ${isTextArea ? 'min-h-[6rem]' : 'h-12 flex items-center'}`}>
      {value || "—"}
    </div>
  </div>
);

interface MediaDisplayProps {
  label: string;
  icon: string;
  mediaItem?: any;
}


const MediaDisplay: React.FC<MediaDisplayProps> = ({ label, icon, mediaItem }) => {
  const hasMedia = mediaItem?.id || mediaItem?.url || mediaItem?.file_path;

  // Fallback URL Construction (Legacy)
  const legacyUrl = useMemo(() => {
    if (!mediaItem?.url && !mediaItem?.file_path) return null;
    let src = mediaItem?.url;
    if (!src && mediaItem?.file_path) {
      src = `${import.meta.env.VITE_API_BASE_URL}/storage/${mediaItem.file_path.replace('public/', '')}`;
    }
    if (src && src.startsWith('http://localhost/') && !src.includes(':8000')) {
      return src.replace('http://localhost/', 'http://localhost:8000/');
    }
    return src;
  }, [mediaItem]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 dark:border-gray-700 flex-1 min-h-[140px] relative overflow-hidden">
        {hasMedia ? (
          mediaItem.type === 'image' || mediaItem.mime_type?.startsWith('image/') || !mediaItem.type ? (
            <SecureImage
              mediaId={mediaItem.id}
              fallbackSrc={legacyUrl}
              alt={label}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <SecureAudio
                mediaId={mediaItem.id}
                fallbackSrc={legacyUrl}
                className="w-full max-w-[200px]"
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <span className="material-symbols-outlined text-3xl opacity-50">{icon}</span>
            <span className="text-xs mt-1">No File</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center text-primary-text dark:text-white mt-1">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[16px] text-primary">{icon === 'mic' ? 'mic' : icon}</span>
          <span className="text-xs font-bold">{label}</span>
        </div>
      </div>
    </div>
  );
};
interface Props {
  data: any;
}

import PledgeQuickStats from './PledgeQuickStats';
import { useAuth } from "../../context/Auth/AuthContext";

const PledgeView: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const { can, enableReceiptPrint } = useAuth();
  const { customer, loan, jewels = [], media = [] } = data;

  // Organize Media by Category
  const mediaMap = useMemo(() => {
    const map: Record<string, any> = {};
    media.forEach((m: any) => {
      // Prioritize category if available, otherwise try to guess or use first available
      // Assuming 'collection_name' or 'category' might be passed. 
      // If the backend returns 'category' (which we sent), use it.
      // If it returns standard Spatie Media Library 'collection_name', use it.
      const key = m.category || m.collection_name; // Adjust based on actual API response
      if (key) {
        map[key] = m;
      }
    });
    return map;
  }, [media]);

  // Profit calculation for summary
  const loanProfit = useMemo(() => {
    if (!data.closure) return 0;
    const netInterest = Number(data.closure.calculated_interest || 0) - Number(data.closure.reduction_amount || 0);
    const fees = Number(loan.processing_fee || 0);
    return netInterest + fees;
  }, [data.closure, loan.processing_fee]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-3 z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
          </button>
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Pledge Details</h2>
            {loan.metal_rate && (
              <div className="flex items-center gap-3 text-xs md:text-sm font-medium bg-gradient-to-r from-amber-50/50 to-slate-50/50 dark:from-amber-900/10 dark:to-slate-900/10 px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/30 shadow-sm cursor-default shrink-0">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="hidden sm:inline">Rate:</span>
                  ₹{loan.metal_rate}/g
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Centered Metal Rate Display */}
        {loan.metal_rate && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Stored Metal Rate</span>
            <div className="flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-lg">₹{loan.metal_rate}/g</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 z-10">
          {enableReceiptPrint && (
            <button
              onClick={() => navigate(`/pledges/${data.id}/receipt`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Receipt</span>
            </button>
          )}


        </div>
      </header>

      <main className="flex flex-col gap-6 p-4 pb-48 w-full max-w-5xl mx-auto">
        {!can('pledge.view') ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You don't have permission to view pledge details.</p>
            {/* Debug Info */}
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
              <p><strong>Debug Info:</strong></p>
              <p>Check: pledge.view</p>
              <p>Has Permission: {can('pledge.view') ? 'YES' : 'NO'}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Overview */}
            <PledgeQuickStats loan={loan} jewels={jewels} />

            {/* Closure Details Section - Only visible if closed */}
            {data.closure && (
              <section className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-5 shadow-sm border border-rose-200 dark:border-rose-800/30">
                <div className="flex items-center gap-3 mb-5 border-b border-rose-200 dark:border-rose-800/30 pb-3">
                  <span className="material-symbols-outlined text-rose-600 dark:text-rose-500">task_alt</span>
                  <h3 className="text-rose-800 dark:text-rose-400 text-xl font-bold">Closure Details</h3>
                  <div className="ml-auto px-3 py-1 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                    Closed
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="col-span-1 lg:col-span-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl p-0.5 border border-amber-200 dark:border-amber-800/30">
                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                      <ReadOnlyField label="Total Loan Profit (₹)" value={loanProfit.toLocaleString('en-IN')} />
                    </div>
                  </div>
                  <ReadOnlyField label="Closed Date" value={data.closure.closed_date} />
                  <ReadOnlyField label="Total Payable (₹)" value={data.closure.total_payable} />
                  <div className="bg-rose-100/50 dark:bg-rose-900/20 rounded-lg">
                    <ReadOnlyField label="Balance Amount (₹)" value={data.closure.balance_amount} />
                  </div>

                  <ReadOnlyField label="Calculated Interest (₹)" value={data.closure.calculated_interest} />
                  <ReadOnlyField label="Reduction (₹)" value={data.closure.reduction_amount} />
                  <ReadOnlyField label="Method" value={data.closure.calculation_method} />

                  <ReadOnlyField label="Duration" value={data.closure.duration_str} />
                  <ReadOnlyField label="Final Interest Rate" value={data.closure.interest_rate_snapshot} />
                  {data.closure.metal_rate && <ReadOnlyField label="Metal Rate (at closure)" value={`₹${data.closure.metal_rate}/g`} />}

                  {/* Detailed breakdown if needed */}
                  {(Number(data.closure.interest_reduction) > 0 || Number(data.closure.additional_reduction) > 0) && (
                    <>
                      <ReadOnlyField label="Interest Taken (₹)" value={data.closure.interest_reduction} />
                      <ReadOnlyField label="Addt. Reduction (₹)" value={data.closure.additional_reduction} />
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Extra Loan Details Section */}
            {loan.extras && loan.extras.length > 0 && (
              <section className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 shadow-sm border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-center gap-3 mb-5 border-b border-amber-200 dark:border-amber-800/30 pb-3">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-500">add_circle</span>
                  <h3 className="text-amber-800 dark:text-amber-400 text-xl font-bold">Extra Loan Details</h3>
                  <div className="ml-auto px-3 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                    {loan.extras.length} Record{loan.extras.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {loan.extras.sort((a: any, b: any) => new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime()).map((extra: any, index: number, arr: any[]) => (
                    <div key={extra.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-100 dark:border-amber-800/50 shadow-sm relative pt-6 md:pt-4">

                      <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 border-2 border-white dark:border-gray-900">
                        {arr.length - index}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReadOnlyField label="Disbursement Date" value={extra.disbursement_date} />
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-300">
                          <ReadOnlyField label="Extra Amount (₹)" value={extra.extra_amount} />
                        </div>
                        <ReadOnlyField label="Payment Method" value={extra.payment_method} />

                        {extra.notes && <ReadOnlyField label="Notes" value={extra.notes} isTextArea />}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Partial Payments Section */}
            {loan.payments && loan.payments.length > 0 && (
              <section className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-5 shadow-sm border border-indigo-200 dark:border-indigo-800/30">
                <div className="flex items-center gap-3 mb-5 border-b border-indigo-200 dark:border-indigo-800/30 pb-3">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-500">payments</span>
                  <h3 className="text-indigo-800 dark:text-indigo-400 text-xl font-bold">Partial Payment Details</h3>
                  <div className="ml-auto px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    {loan.payments.length} Transaction{loan.payments.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {loan.payments.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((payment: any, index: number, arr: any[]) => (
                    <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50 shadow-sm relative pt-6 md:pt-4">
                      {/* Badge for chronological order (Reverse index since we sorted Descending, or just standard numbers) */}
                      {/* Let's show #1 for the oldest, implying sequence. Since we sort Desc (newest first), the index is reversed logic if we want #1 to be first payment. */}
                      {/* Actually, just showing just the raw index from map (0..n) might be confusing if sorted. Let's just show 'Payment' label or simple bullet. */}
                      <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 border-2 border-white dark:border-gray-900">
                        {arr.length - index}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReadOnlyField label="Payment Date" value={payment.payment_date} />
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-300">
                          <ReadOnlyField label="Total Paid (₹)" value={payment.total_paid_amount} />
                        </div>
                        <ReadOnlyField label="Payment Method" value={payment.payment_method} />

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <ReadOnlyField label="Principal Paid (₹)" value={payment.principal_amount} />
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <ReadOnlyField label="Interest Paid (₹)" value={payment.interest_amount} />
                        </div>

                        {payment.notes && <ReadOnlyField label="Notes" value={payment.notes} isTextArea />}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Customer Details Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="material-symbols-outlined text-primary">person</span>
                <h3 className="text-gray-800 dark:text-white text-xl font-bold">Customer Details</h3>
              </div>

              <div className="flex flex-col gap-4">
                <ReadOnlyField label="Name" value={customer.name} />
                <ReadOnlyField label="Mobile No" value={customer.mobile_no} />

                {(customer.whatsapp_no) && (
                  <ReadOnlyField label="Whatsapp No" value={customer.whatsapp_no} />
                )}

                <ReadOnlyField label="Address" value={customer.address} isTextArea />

                <div className="flex flex-col sm:flex-row gap-3">
                  <ReadOnlyField label="ID Type" value={customer.id_proof_type} />
                  <ReadOnlyField label="ID Number" value={customer.id_proof_number} />
                </div>

                {/* Slot 1: Customer Document */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Customer Document</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <MediaDisplay
                      label="Customer Doc"
                      icon="description"
                      mediaItem={
                        mediaMap['customer_document'] ||
                        media.find((m: any) => m.category === 'customer_document' || m.collection_name === 'customer_document') ||
                        (customer.document_url ? { url: customer.document_url, type: 'image' } : undefined)
                      }
                    />
                    {/* ID Proof Image can be the same as doc or separate, usually we just show the doc */}
                    <MediaDisplay
                      label="Customer Image"
                      icon="face"
                      mediaItem={
                        mediaMap['customer_image'] ||
                        media.find((m: any) => m.category === 'customer_image' || m.collection_name === 'customer_image') ||
                        (customer.image_url ? { url: customer.image_url, type: 'image' } : undefined)
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Jewel Details Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="material-symbols-outlined text-primary">diamond</span>
                <h3 className="text-gray-800 dark:text-white text-xl font-bold">Jewel Details</h3>
              </div>

              {jewels.map((jewel: any, index: number) => (
                <div key={index} className={`flex flex-col gap-4 ${index > 0 ? 'border-t pt-6 mt-2 border-dashed border-gray-200 dark:border-gray-700' : ''}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="Jewel Type" value={jewel.jewel_type} />
                    <ReadOnlyField label="Quality" value={jewel.quality} />
                  </div>

                  <ReadOnlyField label="Jewel Description" value={jewel.description} />
                  <ReadOnlyField label="Pieces" value={jewel.pieces} />

                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="Weight (g)" value={jewel.weight} />
                    <ReadOnlyField label="Stone Weight (g)" value={jewel.stone_weight} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="Weight Reduction (g)" value={jewel.weight_reduction} />
                    <ReadOnlyField label="Net Weight (g)" value={jewel.net_weight} />
                  </div>

                  {/* Jewel Image */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="h-40 w-full md:w-1/2">
                      <MediaDisplay
                        label={`Jewel ${index + 1}`}
                        icon="diamond"
                        mediaItem={media.find((m: any) => m.jewel_id === jewel.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Loan Details Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="material-symbols-outlined text-primary">request_quote</span>
                <h3 className="text-gray-800 dark:text-white text-xl font-bold">Loan Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Loan Number" value={loan.loan_no} />
                <ReadOnlyField label="Loan Date" value={loan.date} />
                <ReadOnlyField label="Loan Amount (₹)" value={loan.amount} />
                <ReadOnlyField label="Interest (%)" value={loan.interest_percentage} />
                <ReadOnlyField label="Validity (Months)" value={loan.validity_months} />
                <ReadOnlyField label="Due Date" value={loan.due_date} />
                <ReadOnlyField label="Estimated Amount (₹)" value={loan.estimated_amount} />
                {loan.metal_rate && <ReadOnlyField label="Metal Rate" value={loan.metal_rate} />}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Payment Method" value={loan.payment_method} />
                <ReadOnlyField label="Processing Fee (₹)" value={loan.processing_fee} />
                {/* If we have total given amount available in loan data, show it, else calculate or skip */}
                <ReadOnlyField label="Amount Given (₹)" value={loan.amount_to_be_given || loan.amount} />
              </div>

              {/* Slot 3: Evidence */}
              <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Evidence</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <MediaDisplay
                    label="Audio Evidence"
                    icon="mic"
                    mediaItem={mediaMap['evidence_media'] || media.find((m: any) => m.category === 'evidence_media' || m.collection_name === 'evidence_media')}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-center py-8">
              <div className="w-full max-w-sm flex flex-col gap-4">
                <CommunicationButtons
                  pledge={data}
                />
                <button
                  onClick={() => navigate(`/pledges/${data.id}/edit`)}
                  className="flex w-full items-center justify-center gap-2.5 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_square</span>
                  <span>Edit Pledge Details</span>
                </button>
                {can('pledge.delete') && (
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this pledge? This action cannot be undone.")) {
                        try {
                          await api.delete(`/pledges/${data.id}`);
                          navigate('/pledges');
                        } catch (error) {
                          console.error("Failed to delete pledge", error);
                          alert("Failed to delete pledge.");
                        }
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2.5 px-8 py-3 bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30 rounded-xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    <span>Delete Pledge</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PledgeView;

