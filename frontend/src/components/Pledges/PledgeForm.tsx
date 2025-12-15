import React, { useState, useEffect, useRef } from "react";
import http from "../../api/http";
import { AudioRecorder } from "../../components/audiocamera/AudioRecorder";
import { CameraCapture } from "../../components/audiocamera/CameraCapture";

// --- UI Components from Create.tsx ---

interface MediaUploadBlockProps {
  label: string;
  icon: string;
  onCamera?: () => void;
  onGallery?: () => void;
  onRecord?: () => void;
  onUpload?: () => void;
  isAudio?: boolean;
  file?: File | null;
  onRemove?: () => void;
}

const MediaUploadBlock: React.FC<MediaUploadBlockProps> = ({
  label, icon, onCamera, onGallery, onRecord, onUpload, isAudio = false, file, onRemove
}) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 dark:border-gray-700 flex-1 min-h-[140px] relative">
        {file ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {isAudio ? (
              <div className="w-full flex flex-col items-center justify-center p-2">
                <audio controls src={URL.createObjectURL(file)} className="w-full h-8" />
              </div>
            ) : (
              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-lg" />
            )}
            <button onClick={onRemove} type="button" className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center px-2">{file.name}</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-gray-400 text-3xl">{icon}</span>
            <div className="flex gap-2">
              {!isAudio ? (
                <>
                  <button type="button" onClick={onCamera} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-sm">Camera</button>
                  <button type="button" onClick={onGallery} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">Gallery</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onRecord} className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-sm">Record</button>
                  <button type="button" onClick={onUpload} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">Upload</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-center text-primary-text dark:text-white mt-1">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[16px] text-primary">{icon === 'mic' ? 'mic' : 'photo_camera'}</span>
          <span className="text-xs font-bold">{label}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Form Component ---

interface Props {
  initial?: any;
  onSubmit: (fd: FormData) => Promise<any>;
}

const PledgeForm: React.FC<Props> = ({ initial, onSubmit }) => {
  // --- State ---

  // Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'doc' | 'jewel' | 'evidence' | 'customer_image' | null>(null);

  // Handlers for Modals
  const openCamera = (slot: 'doc' | 'jewel' | 'customer_image') => {
    setActiveSlot(slot);
    setIsCameraOpen(true);
  };

  const openAudio = () => {
    setActiveSlot('evidence');
    setIsAudioOpen(true);
  };

  const handleCapture = (file: File) => {
    if (activeSlot === 'doc') setDocFile(file);
    if (activeSlot === 'jewel') setJewelFile(file);
    if (activeSlot === 'evidence') setEvidenceFile(file);
    if (activeSlot === 'customer_image') setCustomerImageFile(file);

    // Close modals
    setIsCameraOpen(false);
    setIsAudioOpen(false);
    setActiveSlot(null);
  };

  // Customer
  const [customer, setCustomer] = useState(initial?.customer ?? {
    name: "", mobile_no: "", whatsapp_no: "", address: "", sub_address: "", id_proof_type: "Aadhar", id_proof_number: ""
  });

  // Loan
  const [loan, setLoan] = useState({
    loan_no: initial?.loan?.loan_no ?? "",
    date: initial?.loan?.date ?? new Date().toISOString().split('T')[0],
    amount: initial?.loan?.amount ?? "",
    interest_percentage: initial?.loan?.interest_percentage ?? "1.5%",
    validity_months: initial?.loan?.validity_months ?? "3",
    due_date: initial?.loan?.due_date ?? "",
    payment_method: initial?.loan?.payment_method ?? "Cash",
    processing_fee: initial?.loan?.processing_fee ?? "",
    estimated_amount: initial?.loan?.estimated_amount ?? "",
    include_processing_fee: initial?.loan?.include_processing_fee ?? true,
    interest_taken: initial?.loan?.interest_taken ?? false,
    amount_to_be_given: initial?.loan?.amount_to_be_given ?? "",
  });

  // Jewels (Array)
  // We strictly initialize with at least one item if empty
  const [jewels, setJewels] = useState<any[]>(initial?.jewels?.length ? initial.jewels : [{
    jewel_type: "", quality: "", description: "", pieces: 1, weight: "", stone_weight: "", net_weight: "", faults: ""
  }]);

  // Files - 3 Distinct Slots
  const [docFile, setDocFile] = useState<File | null>(null);
  const [jewelFile, setJewelFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [customerImageFile, setCustomerImageFile] = useState<File | null>(null);

  // Existing Media (for Edit mode)
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  // Metadata Options
  const [jewelTypes, setJewelTypes] = useState<{ id: number; name: string }[]>([]);
  const [jewelQualities, setJewelQualities] = useState<{ id: number; name: string }[]>([]);

  // Hidden File Inputs for triggering system dialogs
  const docInputRef = useRef<HTMLInputElement>(null);
  const jewelInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const customerImageInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useEffect(() => {
    // Determine initial due date if not set (3 months from now)
    if (!loan.due_date && loan.date) {
      const d = new Date(loan.date);
      d.setMonth(d.getMonth() + parseInt(loan.validity_months || "3"));
      setLoan(prev => ({ ...prev, due_date: d.toISOString().split('T')[0] }));
    }
  }, []);

  useEffect(() => {
    // Load metadata
    http.get("/jewel-types").then(res => Array.isArray(res.data) && setJewelTypes(res.data)).catch(console.error);
    http.get("/jewel-qualities").then(res => Array.isArray(res.data) && setJewelQualities(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (initial?.media) setExistingFiles(initial.media);
  }, [initial]);

  // Recalculate everything when dependencies change
  useEffect(() => {
    // Update amount to be given
    const amt = parseFloat(loan.amount) || 0;
    const procFee = parseFloat(loan.processing_fee) || 0;

    // Simple logic: Amount Given = Amount - (Processing Fee if included) - (Interest if taken upfront?? - usually not standard logic but placeholder)
    // User logic from Create.tsx was just displaying 'Amount to be Given'.
    // NOTE: Create.tsx didn't have calculation logic visible for amount_to_be_given in the viewed snippet, 
    // it just displayed it. We will assume a basic calculation or manual entry if needed, 
    // but usually: Amount - Processing Fee (if included).

    let finalAmt = amt;
    if (loan.include_processing_fee) {
      finalAmt -= procFee;
    }
    // If interest taken logic exists, apply it. (Assuming formula: Amount * Interest% / 100 ?)
    // For now, let's keep it simple as user didn't specify math.

    setLoan(prev => ({ ...prev, amount_to_be_given: finalAmt > 0 ? String(finalAmt) : "0" }));

  }, [loan.amount, loan.processing_fee, loan.include_processing_fee, loan.interest_taken]);


  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const removeExistingFile = (id: number) => {
    setExistingFiles(prev => prev.filter(f => f.id !== id));
    setDeletedFileIds(prev => [...prev, id]);
  };

  const updateJewel = (index: number, field: string, value: any) => {
    const updated = [...jewels];
    updated[index][field] = value;

    // Auto calc net weight
    if (field === 'weight' || field === 'stone_weight') {
      const w = parseFloat(updated[index].weight) || 0;
      const sw = parseFloat(updated[index].stone_weight) || 0;
      updated[index].net_weight = (Math.max(0, w - sw)).toFixed(2);
    }

    setJewels(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    // Customer
    Object.entries(customer).forEach(([k, v]) => fd.append(`customer[${k}]`, String(v ?? "")));

    // Loan
    Object.entries(loan).forEach(([k, v]) => {
      if (typeof v === 'boolean') fd.append(`loan[${k}]`, v ? '1' : '0');
      else fd.append(`loan[${k}]`, String(v ?? ""));
    });

    // Jewels
    jewels.forEach((j, idx) => {
      if (j.id) fd.append(`jewels[${idx}][id]`, String(j.id));
      Object.entries(j).forEach(([k, v]) => {
        if (k !== 'id') fd.append(`jewels[${idx}][${k}]`, String(v ?? ""));
      });
    });

    // Files & Categories
    if (docFile) {
      fd.append("files[]", docFile);
      fd.append("categories[]", "customer_document");
    }
    if (jewelFile) {
      fd.append("files[]", jewelFile);
      fd.append("categories[]", "jewel_image");
    }
    if (evidenceFile) {
      fd.append("files[]", evidenceFile);
      fd.append("categories[]", "evidence_media");
    }
    if (customerImageFile) {
      fd.append("files[]", customerImageFile);
      fd.append("categories[]", "customer_image");
    }

    // Deleted IDs
    deletedFileIds.forEach(id => fd.append("deleted_file_ids[]", String(id)));

    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 pb-48 w-full max-w-5xl mx-auto">

      {/* Hidden Inputs for File Dialogs */}
      <input type="file" ref={docInputRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileSelect(e, setDocFile)} />
      <input type="file" ref={jewelInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setJewelFile)} />
      <input type="file" ref={evidenceInputRef} className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => handleFileSelect(e, setEvidenceFile)} />
      <input type="file" ref={customerImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setCustomerImageFile)} />


      {/* Customer Details Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="material-symbols-outlined text-primary">person_add</span>
          <h3 className="text-gray-800 dark:text-white text-xl font-bold">Customer Details</h3>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Name <span className="text-red-500">*</span></span>
            <input
              value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
              placeholder="Enter full name" type="text" required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Mobile No <span className="text-red-500">*</span></span>
            <input
              value={customer.mobile_no} onChange={e => setCustomer({ ...customer, mobile_no: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
              placeholder="Enter mobile number" type="tel" required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Whatsapp No</span>
            <input
              value={customer.whatsapp_no} onChange={e => setCustomer({ ...customer, whatsapp_no: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
              placeholder="Enter whatsapp number" type="tel"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Address</span>
            <textarea
              value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary p-4 shadow-sm resize-none h-24 outline-none transition-all"
              placeholder="Enter full address"
            ></textarea>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-col gap-1.5 w-full sm:w-1/3">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">ID Type</span>
              <div className="relative">
                <select
                  value={customer.id_proof_type} onChange={e => setCustomer({ ...customer, id_proof_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 appearance-none shadow-sm outline-none transition-all"
                >
                  <option>Aadhar</option>
                  <option>PAN Card</option>
                  <option>Voter ID</option>
                  <option>Driving License</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>

            <label className="flex flex-col gap-1.5 w-full sm:w-2/3">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">ID Number</span>
              <input
                value={customer.id_proof_number} onChange={e => setCustomer({ ...customer, id_proof_number: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
                placeholder="Enter ID number" type="text"
              />
            </label>
          </div>

          {/* Slot 1: Customer Document */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Upload Document</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <MediaUploadBlock
                label="Customer Doc"
                icon="upload_file"
                file={docFile}
                onRemove={() => setDocFile(null)}
                onGallery={() => docInputRef.current?.click()}
                onCamera={() => openCamera('doc')}
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

        {jewels.map((jewel, index) => (
          <div key={index} className={`flex flex-col gap-4 ${index > 0 ? 'border-t pt-6 mt-2 border-dashed' : ''} relative`}>
            {index > 0 && (
              <button type="button" onClick={() => {
                const updated = [...jewels];
                updated.splice(index, 1);
                setJewels(updated);
              }} className="absolute top-0 right-0 text-red-500 text-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete</span> Remove Item
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Jewel Type <span className="text-red-500">*</span></span>
                <div className="relative">
                  <select
                    value={jewel.jewel_type} onChange={e => updateJewel(index, 'jewel_type', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                  >
                    <option value="" disabled>Select</option>
                    {jewelTypes.length > 0 ? jewelTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    )) : (
                      <>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Quality</span>
                <div className="relative">
                  <select
                    value={jewel.quality} onChange={e => updateJewel(index, 'quality', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                  >
                    <option value="" disabled>Select</option>
                    {jewelQualities.length > 0 ? jewelQualities.map(q => (
                      <option key={q.id} value={q.name}>{q.name}</option>
                    )) : (
                      <>
                        <option value="24K">24K</option>
                        <option value="22K">22K</option>
                        <option value="18K">18K</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Description</span>
              <input
                value={jewel.description} onChange={e => updateJewel(index, 'description', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
                placeholder="Item description" type="text"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Pieces</span>
              <input
                value={jewel.pieces} onChange={e => updateJewel(index, 'pieces', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all"
                placeholder="1" type="number"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Weight (g) <span className="text-red-500">*</span></span>
                <input
                  value={jewel.weight} onChange={e => updateJewel(index, 'weight', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" placeholder="0.00" step="0.01" type="number" required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Stone Weight (g)</span>
                <input
                  value={jewel.stone_weight} onChange={e => updateJewel(index, 'stone_weight', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" placeholder="0.00" step="0.01" type="number"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Net Weight (g)</span>
              <input
                value={jewel.net_weight} readOnly
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 focus:outline-none h-12 px-4 shadow-sm cursor-not-allowed outline-none transition-all" placeholder="0.00" type="number"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Faults</span>
              <input
                value={jewel.faults} onChange={e => updateJewel(index, 'faults', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" placeholder="Any damage or faults" type="text"
              />
            </label>
          </div>
        ))}

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setJewels([...jewels, { jewel_type: "", quality: "", description: "", pieces: 1, weight: "", stone_weight: "", net_weight: "", faults: "" }])} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">add_circle</span> Add Another Jewel
          </button>
        </div>

        {/* Slot 2: Jewel Image */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Upload Jewel Image</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <MediaUploadBlock
              label="Capture Jewel"
              icon="add_a_photo"
              file={jewelFile}
              onRemove={() => setJewelFile(null)}
              onGallery={() => jewelInputRef.current?.click()}
              onCamera={() => openCamera('jewel')}
            />
          </div>
        </div>
      </section>

      {/* Loan Details Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700 mb-20">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <h3 className="text-gray-800 dark:text-white text-xl font-bold">Loan Details</h3>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Loan No <span className="text-red-500">*</span></span>
            <input
              value={loan.loan_no} onChange={e => setLoan({ ...loan, loan_no: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" type="text" placeholder="Enter Loan No" required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Amount <span className="text-red-500">*</span></span>
            <input
              value={loan.amount} onChange={e => setLoan({ ...loan, amount: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" placeholder="₹0" type="number" required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Date <span className="text-red-500">*</span></span>
              <input
                value={loan.date} onChange={e => setLoan({ ...loan, date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" type="date" required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Due Date</span>
              <input
                value={loan.due_date} readOnly
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 focus:outline-none h-12 px-4 shadow-sm cursor-not-allowed outline-none transition-all" type="date"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Validity Months</span>
              <input
                value={loan.validity_months} onChange={e => setLoan({ ...loan, validity_months: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" type="number"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Interest %</span>
              <div className="relative">
                <select
                  value={loan.interest_percentage} onChange={e => setLoan({ ...loan, interest_percentage: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                >
                  <option>1.5%</option>
                  <option>2.0%</option>
                  <option>2.5%</option>
                  <option>3.0%</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Payment Method</span>
            <div className="relative">
              <select
                value={loan.payment_method} onChange={e => setLoan({ ...loan, payment_method: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>UPI</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Processing Fee</span>
            <input
              value={loan.processing_fee} onChange={e => setLoan({ ...loan, processing_fee: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all" placeholder="₹0" type="number"
            />
          </label>

          {/* Slot 3: Evidence Audio/Media */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Media Evidence</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <MediaUploadBlock
                label="Evidence (Audio/Img)"
                icon="mic"
                isAudio={true}
                file={evidenceFile}
                onRemove={() => setEvidenceFile(null)}
                onUpload={() => evidenceInputRef.current?.click()}
                onRecord={() => openAudio()}
              />
              <MediaUploadBlock
                label="Customer Image"
                icon="account_box"
                file={customerImageFile}
                onRemove={() => setCustomerImageFile(null)}
                onGallery={() => customerImageInputRef.current?.click()}
                onCamera={() => openCamera('customer_image')}
              />
            </div>
          </div>

          {/* Existing Files Display (for Edit Mode) */}
          {existingFiles.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Existing Files</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingFiles.map((f) => (
                  <div key={f.id} className="relative group border rounded-xl overflow-hidden aspect-square border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => removeExistingFile(f.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 z-10"
                    >&times;</button>
                    {f.type === 'image' ? (
                      <img src={f.url} alt="existing" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                        <span className="material-symbols-outlined text-4xl">audiotrack</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Styled Checkbox Tiles */}
          <div className="flex flex-col gap-3 pt-2">
            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer group transition-all ${loan.include_processing_fee ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <span className="text-gray-800 dark:text-white text-base font-medium">Include Processing Fee?</span>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${loan.include_processing_fee ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                {loan.include_processing_fee && <span className="material-symbols-outlined text-white text-sm leading-none">check</span>}
              </div>
              <input
                checked={loan.include_processing_fee}
                onChange={(e) => setLoan({ ...loan, include_processing_fee: e.target.checked })}
                className="hidden"
                type="checkbox"
              />
            </label>

            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer group transition-all ${loan.interest_taken ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <span className="text-gray-800 dark:text-white text-base font-medium">Interest Taken?</span>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${loan.interest_taken ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                {loan.interest_taken && <span className="material-symbols-outlined text-white text-sm leading-none">check</span>}
              </div>
              <input
                checked={loan.interest_taken}
                onChange={(e) => setLoan({ ...loan, interest_taken: e.target.checked })}
                className="hidden"
                type="checkbox"
              />
            </label>
          </div>

          <div className="flex items-center justify-between bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 mt-2">
            <span className="text-primary-text dark:text-white font-bold text-lg">Amount to be Given</span>
            <span className="text-primary font-extrabold text-2xl tracking-tight">₹{loan.amount_to_be_given || "0"}</span>
          </div>

        </div>
      </section>

      <div className="mt-2 mb-8 flex justify-center sticky bottom-4 z-20">
        <button type="submit" className="flex w-full max-w-sm px-8 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark transition-all h-14 text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98]">
          <span className="material-symbols-outlined">save</span>
          Save Pledge
        </button>
      </div>

      {/* Modals */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      <AudioRecorder
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        onCapture={handleCapture}
      />

    </form>
  );
};

export default PledgeForm;
