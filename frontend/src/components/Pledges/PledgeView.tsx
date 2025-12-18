import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
  const url = useMemo(() => {
    if (!mediaItem?.url) return null;
    if (mediaItem.url.startsWith('http://localhost/') && !mediaItem.url.includes(':8000')) {
      return mediaItem.url.replace('http://localhost/', 'http://localhost:8000/');
    }
    return mediaItem.url;
  }, [mediaItem]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 dark:border-gray-700 flex-1 min-h-[140px] relative overflow-hidden">
        {url ? (
          mediaItem.type === 'image' || mediaItem.mime_type?.startsWith('image/') ? (
            <img src={url} alt={label} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <audio controls src={url} className="w-full max-w-[200px]" />
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

import { useAuth } from "../../context/AuthContext";

const PledgeView: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
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
          <button
            onClick={() => navigate(`/pledges/${data.id}/receipt`)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Receipt</span>
          </button>


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
                  <ReadOnlyField label="Net Weight (g)" value={jewel.net_weight} />
                </div>
              ))}

              {/* Slot 2: Jewel Image */}
              <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Jewel Images</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <MediaDisplay
                    label="Jewel Photo"
                    icon="camera_alt"
                    mediaItem={mediaMap['jewel_image'] || media.find((m: any) => m.category === 'jewel_image' || m.collection_name === 'jewel_image')}
                  />
                </div>
              </div>
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
              <button
                onClick={() => navigate(`/pledges/${data.id}/edit`)}
                className="flex items-center gap-2.5 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="material-symbols-outlined text-[20px]">edit_square</span>
                <span>Edit Pledge Details</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PledgeView;

