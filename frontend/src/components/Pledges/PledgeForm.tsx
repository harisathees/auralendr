import React, { useState, useRef, useEffect, useMemo } from "react";
import api from "../../api/apiClient";
import { AudioRecorder } from "../../components/audiocamera/AudioRecorder";
import { CameraCapture } from "../../components/audiocamera/CameraCapture";

import { useAuth } from "../../context/Auth/AuthContext";
import { compressImage } from "../../utils/imageCompression";

// --- UI Components from Create.tsx ---

const FilePreview: React.FC<{ file: File; className?: string }> = ({ file, className }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!preview) return null;
  return <img src={preview} alt="preview" className={className} />;
};

const AudioPreview: React.FC<{ file: File; className?: string }> = ({ file, className }) => {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!preview) return null;
  return <audio controls src={preview} className={className} />;
}

interface MediaUploadBlockProps {
  label: string;
  icon: string;
  onCamera?: () => void;
  onGallery?: () => void;
  onRecord?: () => void;
  onUpload?: () => void;
  isAudio?: boolean;
  file?: File | null;
  existingUrl?: string | null;
  onRemove?: () => void;
}

const MediaUploadBlock: React.FC<MediaUploadBlockProps> = ({
  label, icon, onCamera, onGallery, onRecord, onUpload, isAudio = false, file, existingUrl, onRemove
}) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 dark:border-gray-700 flex-1 min-h-[140px] relative">
        {file ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {isAudio ? (
              <div className="w-full flex flex-col items-center justify-center p-2">
                <AudioPreview file={file} className="w-full h-8" />
              </div>
            ) : (
              <FilePreview file={file} className="w-full h-full object-cover rounded-lg" />
            )}
            <button onClick={onRemove} type="button" className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center px-2">{file.name}</span>
          </div>
        ) : existingUrl ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {isAudio ? (
              <div className="text-xs text-gray-500">Audio Preview Not Supported for URL</div>
            ) : (
              <img src={existingUrl} alt="existing" className="w-full h-full object-cover rounded-lg" />
            )}
            <button onClick={onRemove} type="button" className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <span className="text-xs text-green-600 mt-2 truncate w-full text-center px-2 font-bold bg-green-50 rounded px-2 py-0.5">Existing File</span>
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
    </div >
  );
};

// --- Main Form Component ---

interface Props {
  initial?: any;
  onSubmit: (fd: FormData) => Promise<any>;
  isSubmitting?: boolean;
}

const PledgeForm: React.FC<Props> = ({ initial, onSubmit, isSubmitting = false }) => {
  const { user } = useAuth(); // Get current user (and branch_id)

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

  // Customer Search Logic
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [activeSearchField, setActiveSearchField] = useState<string | null>(null);

  const searchCustomer = async (query: string, field: string) => {
    if (!query) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/api/customers/search?query=${query}`);
      setCustomerSuggestions(res.data || []);
      setActiveSearchField(field);
    } catch (err) {
      console.error("Error searching customer", err);
    }
  };

  const selectCustomer = (c: any) => {
    setCustomer({
      ...customer,
      name: c.name || "",
      mobile_no: c.mobile_no || "",
      whatsapp_no: c.whatsapp_no || "",
      address: c.address || "",
      sub_address: c.sub_address || "",
      id_proof_type: c.id_proof_type || "Aadhar",
      id_proof_number: c.id_proof_number || ""
    });
    setFetchedDocUrl(c.document_url || null);
    setCustomerSuggestions([]);
    setActiveSearchField(null);
  };

  // Add customerId separately to track if it's an existing customer
  const [customerId, setCustomerId] = useState<string | null>(initial?.customer_id ?? null);

  // Wrap selectCustomer to also set ID
  const handleSelectCustomer = (c: any) => {
    setCustomerId(c.id);
    selectCustomer(c);
  };

  const clearSuggestions = () => {
    setTimeout(() => setCustomerSuggestions([]), 200);
  };

  // Loan
  const [loan, setLoan] = useState({
    loan_no: initial?.loan?.loan_no ?? "",
    date: initial?.loan?.date ?? (() => {
      const d = new Date();
      // Adjust to local timezone to ensure correct date
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split('T')[0];
    })(),
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
    metal_rate: initial?.loan?.metal_rate ?? "",
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

  // Fetched URLs from Customer Search
  const [fetchedDocUrl, setFetchedDocUrl] = useState<string | null>(null);


  // Existing Media (for Edit mode)
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  // Metadata Options
  // Metadata Options
  const [jewelTypes, setJewelTypes] = useState<{ id: number; name: string }[]>([]);
  const [jewelQualities, setJewelQualities] = useState<{ id: number; name: string }[]>([]);
  const [jewelNames, setJewelNames] = useState<{ id: number; name: string }[]>([]);
  const [activeSearchJewelIndex, setActiveSearchJewelIndex] = useState<number | null>(null);

  // Hidden File Inputs for triggering system dialogs
  const docInputRef = useRef<HTMLInputElement>(null);
  const jewelInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const customerImageInputRef = useRef<HTMLInputElement>(null);

  // Loan Configs
  const [interestRates, setInterestRates] = useState<{ id: number; rate: string; jewel_type_id?: number | null; estimation_percentage?: string }[]>([]);
  const [loanValidities, setLoanValidities] = useState<{ id: number; months: number; label?: string; jewel_type_id?: number | null }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string; balance: string; show_balance: boolean; is_outbound?: boolean }[]>([]);
  const [metalRates, setMetalRates] = useState<{ name: string; metal_rate?: { rate: string } }[]>([]);
  const [processingFeesConfigs, setProcessingFeesConfigs] = useState<{ jewel_type_id: number; percentage: string; max_amount: string | null }[]>([]);

  // --- Effects ---

  // Fetch processing fees when branch ID is available
  useEffect(() => {
    if (user?.branch_id) {
      api.get(`/api/processing-fees?branch_id=${user.branch_id}`)
        .then(res => setProcessingFeesConfigs(res.data))
        .catch(console.error);
    }
  }, [user?.branch_id]);
  useEffect(() => {
    // Determine due date (loan date + validity months)
    if (loan.date) {
      const d = new Date(loan.date);
      d.setMonth(d.getMonth() + parseInt(loan.validity_months || "3"));
      setLoan(prev => ({ ...prev, due_date: d.toISOString().split('T')[0] }));
    }
  }, [loan.date, loan.validity_months]);

  // Automate Processing Fee Calculation
  useEffect(() => {
    // If not including fee, force it to 0
    if (!loan.include_processing_fee) {
      if (loan.processing_fee !== "0") {
        setLoan(prev => ({ ...prev, processing_fee: "0" }));
      }
      return;
    }

    if (!loan.amount || !jewels.length || !processingFeesConfigs.length) return;

    const amount = parseFloat(loan.amount);
    if (isNaN(amount) || amount <= 0) return;

    // Determine jewel type from first jewel
    const firstJewelTypeName = jewels[0]?.jewel_type;
    const jewelTypeObj = jewelTypes.find(t => t.name === firstJewelTypeName);

    if (!jewelTypeObj) return;

    // Find config for this jewel type
    const config = processingFeesConfigs.find(c => c.jewel_type_id === jewelTypeObj.id);
    if (!config) return;

    // Calculate Fee
    const percentage = parseFloat(config.percentage);
    let fee = amount * (percentage / 100);

    // Apply Cap
    const maxAmount = config.max_amount ? parseFloat(config.max_amount) : null;
    if (maxAmount !== null && fee > maxAmount) {
      fee = maxAmount;
    }

    // Update state
    setLoan(prev => ({ ...prev, processing_fee: Math.round(fee).toString() }));

  }, [loan.amount, jewels, processingFeesConfigs, jewelTypes, loan.include_processing_fee]);

  // Automate Estimated Amount Calculation
  useEffect(() => {
    if (!metalRates.length || !interestRates.length) return;

    // 1. Calculate Total Net Weight of all jewels
    const totalNetWeight = jewels.reduce((sum, j) => sum + (parseFloat(j.net_weight) || 0), 0);

    if (totalNetWeight <= 0) {
      setLoan(prev => ({ ...prev, estimated_amount: "" }));
      return;
    }

    // 2. Identify Metal Type (use first jewel's type or fallback to Gold if unknown/mixed)
    // Strategy: Look at the first jewel's type. If it contains 'Silver', use Silver rate. Else default to Gold.
    const firstJewelTypeName = jewels[0]?.jewel_type || "";
    const isSilver = firstJewelTypeName.toLowerCase().includes("silver");

    const rateObj = metalRates.find(r => r.name.toLowerCase().includes(isSilver ? "silver" : "gold"));
    const ratePerGram = parseFloat(rateObj?.metal_rate?.rate || "0");

    if (!ratePerGram) return; // Cannot calculate without rate

    // 3. Get Estimation Percentage from selected Interest Rate
    // Find rate object matching current loan.interest_percentage
    // loan.interest_percentage matches either "1.5%" or just "1.5" depending on select value. 
    // The select options use `${parseFloat(r.rate)}%` as value.
    const currentInterestRateObj = interestRates.find(r => `${parseFloat(r.rate)}%` === loan.interest_percentage);
    const estimationPercent = parseFloat(currentInterestRateObj?.estimation_percentage || "0");

    if (!estimationPercent) return;

    // 4. Calculate
    // Estimated Amount = Total Net Weight * Rate/gram * (Estimation% / 100)
    const estimated = totalNetWeight * ratePerGram * (estimationPercent / 100);

    setLoan(prev => ({
      ...prev,
      estimated_amount: Math.round(estimated).toString(),
      metal_rate: ratePerGram.toString()
    }));

  }, [jewels, loan.interest_percentage, metalRates, interestRates]);

  // Derived: Filter Available Validity Months based on Jewel Type
  // Logic: Check the *first* jewel's type. If it restricts validities, use those.
  // If no jewel type selected or no restrictions, show all.
  const firstJewelTypeName = jewels[0]?.jewel_type;
  const selectedJewelTypeObj = jewelTypes.find(t => t.name === firstJewelTypeName);

  const filteredValidityOptions = useMemo(() => {
    // Logic: 
    // 1. Fetch all validities where jewel_type_id match selected jewel type ID
    // 2. ALSO fetch all validities where jewel_type_id is NULL (Globals)

    if (!selectedJewelTypeObj) {
      // If no type selected, show only Globals? Or All?
      // Let's show only Globals to be safe, or allow user to pick type first.
      // Usually defaults to Global.
      return loanValidities.filter(v => !v.jewel_type_id);
    }

    return loanValidities.filter(v =>
      !v.jewel_type_id || v.jewel_type_id === selectedJewelTypeObj.id
    );
  }, [selectedJewelTypeObj, loanValidities]);

  const filteredInterestOptions = useMemo(() => {
    if (!selectedJewelTypeObj) {
      return interestRates.filter(r => !r.jewel_type_id);
    }
    return interestRates.filter(r =>
      !r.jewel_type_id || r.jewel_type_id === selectedJewelTypeObj.id
    );
  }, [selectedJewelTypeObj, interestRates]);

  // Balance Validation Logic
  // Balance Validation Logic
  const balanceValidation = useMemo(() => {
    // console.log("Validating Balance...", { method: loan.payment_method, amountGiven: loan.amount_to_be_given, sourceCount: paymentMethods.length });

    if (!loan.payment_method) return null;

    // Find selected money source
    const source = paymentMethods.find(p => p.name === loan.payment_method);
    if (!source) return null;

    const amount = parseFloat(loan.amount || "0");
    // Handle potential string formatting (remove commas if present)
    const rawBalance = String(source.balance).replace(/,/g, '');
    const balance = parseFloat(rawBalance);

    if (isNaN(amount) || isNaN(balance)) return null;

    const isSufficient = balance >= amount;

    return {
      isSufficient,
      message: isSufficient
        ? "Sufficient funds available"
        : "Insufficient funds in selected source"
    };
  }, [loan.payment_method, loan.amount, paymentMethods]);

  // Auto-select first validity if current is invalid? 
  // Maybe better to just let user switch. But let's check if current is in options.
  useEffect(() => {
    if (filteredValidityOptions.length > 0) {
      const currentInOptions = filteredValidityOptions.some(v => String(v.months) === String(loan.validity_months));
      if (!currentInOptions) {
        // Default to the first allowed one
        setLoan(prev => ({ ...prev, validity_months: String(filteredValidityOptions[0].months) }));
      }
    }
  }, [filteredValidityOptions, loan.validity_months]);

  // Auto-select first interest if current is invalid
  useEffect(() => {
    if (filteredInterestOptions.length > 0) {
      // Check if current rate (string x.x%) matches any option
      // option values are "1.5%" etc.
      const currentInOptions = filteredInterestOptions.some(r => `${parseFloat(r.rate)}%` === loan.interest_percentage.trim());

      if (!currentInOptions && loan.interest_percentage) {
        setLoan(prev => ({ ...prev, interest_percentage: `${parseFloat(filteredInterestOptions[0].rate)}%` }));
      }
    }
  }, [filteredInterestOptions, loan.interest_percentage]);

  // Auto-select first payment method if current is invalid
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const currentInOptions = paymentMethods.some(p => p.name === loan.payment_method);
      if (!currentInOptions) {
        setLoan(prev => ({ ...prev, payment_method: paymentMethods[0].name }));
      }
    }
  }, [paymentMethods, loan.payment_method]);
  useEffect(() => {
    // Load metadata
    api.get("/api/jewel-types").then(res => Array.isArray(res.data) && setJewelTypes(res.data)).catch(console.error);
    api.get("/api/jewel-qualities").then(res => Array.isArray(res.data) && setJewelQualities(res.data)).catch(console.error);
    api.get("/api/jewel-names").then(res => Array.isArray(res.data) && setJewelNames(res.data)).catch(console.error);
    api.get("/api/interest-rates").then(res => Array.isArray(res.data) && setInterestRates(res.data)).catch(console.error);
    api.get("/api/loan-validities").then(res => Array.isArray(res.data) && setLoanValidities(res.data)).catch(console.error);
    api.get("/api/money-sources").then(res => {
      if (Array.isArray(res.data)) {
        setPaymentMethods(res.data.filter((m: any) => m.is_outbound));
      }
    }).catch(console.error);
    api.get("/api/metal-rates").then(res => Array.isArray(res.data) && setMetalRates(res.data)).catch(console.error); // Added this line
  }, []);

  useEffect(() => {
    if (initial?.media) setExistingFiles(initial.media);
  }, [initial]);

  // Recalculate everything when dependencies change
  // Recalculate everything when dependencies change
  useEffect(() => {
    // Update amount to be given
    const amt = parseFloat(loan.amount) || 0;
    const procFee = parseFloat(loan.processing_fee) || 0;

    let finalAmt = amt;

    // Deduct Processing Fee
    if (loan.include_processing_fee) {
      finalAmt -= procFee;
    }

    // Deduct Upfront Interest if taken
    if (loan.interest_taken) {
      const intRate = parseFloat(loan.interest_percentage) || 0;
      const interestAmt = amt * (intRate / 100);
      finalAmt -= interestAmt;
    }

    setLoan(prev => ({ ...prev, amount_to_be_given: finalAmt > 0 ? Math.round(finalAmt).toString() : "0" }));

  }, [loan.amount, loan.processing_fee, loan.include_processing_fee, loan.interest_taken, loan.interest_percentage]);


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
    // Customer
    if (customerId) fd.append("customer_id", customerId);
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
    const compressAndAppend = async (file: File, category: string) => {
      // Import the utility dynamically or we can just import at top. 
      // Given the structure, I'll add the import at the top in a separate step if needed,
      // but for now I'll use the imported function.
      const compressed = await compressImage(file);
      fd.append("files[]", compressed);
      fd.append("categories[]", category);
    };

    if (docFile) await compressAndAppend(docFile, "customer_document");
    if (jewelFile) await compressAndAppend(jewelFile, "jewel_image");
    if (evidenceFile) {
      if (evidenceFile.type.startsWith('image/')) {
        await compressAndAppend(evidenceFile, "evidence_media");
      } else {
        fd.append("files[]", evidenceFile);
        fd.append("categories[]", "evidence_media");
      }
    }
    if (customerImageFile) await compressAndAppend(customerImageFile, "customer_image");

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
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter full name" type="text" required
            />
          </label>

          <label className="flex flex-col gap-1.5 z-40">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Mobile No <span className="text-red-500">*</span></span>
            <div className="relative">
              <input
                value={customer.mobile_no}
                onChange={e => {
                  setCustomer({ ...customer, mobile_no: e.target.value });
                  searchCustomer(e.target.value, 'mobile');
                }}
                onBlur={clearSuggestions}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                placeholder="Enter mobile number" type="tel" required
              />
              {activeSearchField === 'mobile' && customerSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto no-scrollbar z-50">
                  {customerSuggestions.map(c => (
                    <div key={c.id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-black dark:text-white" onMouseDown={() => handleSelectCustomer(c)}>
                      <span className="font-bold text-black dark:text-white">{c.name}</span> - {c.mobile_no}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>

          <label className="flex flex-col gap-1.5 z-30">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Whatsapp No</span>
            <div className="relative">
              <input
                value={customer.whatsapp_no}
                onChange={e => {
                  setCustomer({ ...customer, whatsapp_no: e.target.value });
                  searchCustomer(e.target.value, 'whatsapp');
                }}
                onBlur={clearSuggestions}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                placeholder="Enter whatsapp number" type="tel"
              />
              {activeSearchField === 'whatsapp' && customerSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto no-scrollbar z-50">
                  {customerSuggestions.map(c => (
                    <div key={c.id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-black dark:text-white" onMouseDown={() => handleSelectCustomer(c)}>
                      <span className="font-bold text-black dark:text-white">{c.name}</span> - {c.whatsapp_no}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Address</span>
            <textarea
              value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary p-4 shadow-sm resize-none h-24 outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter full address"
            ></textarea>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-col gap-1.5 w-full sm:w-1/3">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">ID Type</span>
              <div className="relative">
                <select
                  value={customer.id_proof_type} onChange={e => setCustomer({ ...customer, id_proof_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 appearance-none shadow-sm outline-none transition-all"
                >
                  <option>Aadhar</option>
                  <option>PAN Card</option>
                  <option>Voter ID</option>
                  <option>Driving License</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>

            <label className="flex flex-col gap-1.5 w-full sm:w-2/3 z-20">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">ID Number</span>
              <div className="relative">
                <input
                  value={customer.id_proof_number}
                  onChange={e => {
                    setCustomer({ ...customer, id_proof_number: e.target.value });
                    searchCustomer(e.target.value, 'id');
                  }}
                  onBlur={clearSuggestions}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter ID number" type="text"
                />
                {activeSearchField === 'id' && customerSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto no-scrollbar z-50">
                    {customerSuggestions.map(c => (
                      <div key={c.id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-black dark:text-white" onMouseDown={() => handleSelectCustomer(c)}>
                        <span className="font-bold text-black dark:text-white">{c.name}</span> - {c.id_proof_number}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                existingUrl={fetchedDocUrl && fetchedDocUrl.startsWith('http://localhost/') && !fetchedDocUrl.includes(':8000') ? fetchedDocUrl.replace('http://localhost/', 'http://localhost:8000/') : fetchedDocUrl}
                onRemove={() => { setDocFile(null); setFetchedDocUrl(null); }}
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
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                  >
                    <option value="" disabled>Select</option>
                    {jewelTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Quality</span>
                <div className="relative">
                  <select
                    value={jewel.quality} onChange={e => updateJewel(index, 'quality', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                  >
                    <option value="" disabled>Select</option>
                    {jewelQualities.map(q => (
                      <option key={q.id} value={q.name}>{q.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>
            </div>

            <div className="relative z-50">
              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Jewel Description</span>
                <input
                  value={jewel.description}
                  onChange={e => updateJewel(index, 'description', e.target.value)}
                  onFocus={() => setActiveSearchJewelIndex(index)}
                  onBlur={() => setTimeout(() => setActiveSearchJewelIndex(null), 200)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                  placeholder="Type to search or enter new" type="text"
                />
              </label>
              {activeSearchJewelIndex === index && jewel.description && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto no-scrollbar z-50">
                  {jewelNames
                    .filter(n => n.name.toLowerCase().includes(jewel.description.toLowerCase()))
                    .map(n => (
                      <div
                        key={n.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-black dark:text-white"
                        onMouseDown={() => updateJewel(index, 'description', n.name)}
                      >
                        {n.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Pieces</span>
              <input
                value={jewel.pieces} onChange={e => updateJewel(index, 'pieces', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                placeholder="1" type="number"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Weight (g) <span className="text-red-500">*</span></span>
                <input
                  value={jewel.weight} onChange={e => updateJewel(index, 'weight', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" placeholder="0.00" step="0.01" type="number" required
                />
              </label>

              <label className="flex flex-col gap-1.5 z-40">
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Stone Weight (g)</span>
                <input
                  value={jewel.stone_weight ?? ""} onChange={e => updateJewel(index, 'stone_weight', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" placeholder="0.00" step="0.01" type="number"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Net Weight (g)</span>
              <input
                value={jewel.net_weight ?? ""} readOnly
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 h-12 px-4 shadow-sm outline-none transition-all cursor-not-allowed" placeholder="0.00"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Faults / Remarks</span>
              <textarea
                value={jewel.faults ?? ""} onChange={e => updateJewel(index, 'faults', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary p-4 shadow-sm resize-none h-20 outline-none transition-all placeholder:text-gray-400"
                placeholder="Describe any damage"
              ></textarea>
            </label>
          </div>
        ))}

        {/* <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setJewels([...jewels, { jewel_type: "", quality: "", description: "", pieces: 1, weight: "", stone_weight: "", net_weight: "", faults: "" }])} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">add_circle</span> Add Another Jewel
          </button>
        </div> */}

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
        <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            <h3 className="text-gray-800 dark:text-white text-xl font-bold">Loan Details</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={loan.date} onChange={e => setLoan({ ...loan, date: e.target.value })}
              className="w-27 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-2 shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              type="date"
              required
              title="Date"
            />
            <span className="text-gray-400 text-xs material-symbols-outlined">arrow_forward</span>
            <input
              value={loan.due_date} readOnly
              className="w-27 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs px-2 shadow-sm cursor-not-allowed outline-none transition-all"
              type="date"
              title="Due Date"
            />
          </div>
        </div>

        {/* Slot 3: Evidence Audio/Media */}
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Media Evidence</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <MediaUploadBlock
              label="Evidence (Audio)"
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

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Loan No <span className="text-red-500">*</span></span>
            <input
              value={loan.loan_no} onChange={e => setLoan({ ...loan, loan_no: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" type="text" placeholder="Enter Loan No" required
            />
          </label>

          <div className="flex gap-4">
            <label className="flex flex-col gap-1.5 flex-1">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Amount <span className="text-red-500">*</span></span>
              <input
                value={loan.amount} onChange={e => setLoan({ ...loan, amount: e.target.value })}
                readOnly={!!initial}
                className={`w-full rounded-lg border h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400 ${!!initial
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                placeholder="₹0" type="number" required
              />
            </label>

            <label className="flex flex-col gap-1.5 w-1/3">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Estimated Amount</span>
              <input
                value={loan.estimated_amount}
                readOnly
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400 text-sm cursor-not-allowed" placeholder="₹0" type="number"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Processing Fee</span>
            <input
              value={loan.processing_fee} onChange={e => setLoan({ ...loan, processing_fee: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" placeholder="₹0" type="number"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Validity Months</span>
              <div className="relative">
                <select
                  value={loan.validity_months} onChange={e => setLoan({ ...loan, validity_months: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                >
                  <option value="" disabled>Select</option>
                  {filteredValidityOptions.map(v => (
                    <option key={v.id} value={v.months}>{v.label || `${v.months} Months`}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Interest %</span>
              <div className="relative">
                <select
                  value={loan.interest_percentage} onChange={e => setLoan({ ...loan, interest_percentage: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                >
                  <option value="" disabled>Select</option>
                  {filteredInterestOptions.map(r => (
                    <option key={r.id} value={`${parseFloat(r.rate)}%`}>{parseFloat(r.rate)}%</option>
                  ))}
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
                className={`w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all ${balanceValidation
                  ? balanceValidation.isSufficient
                    ? 'border-green-500 ring-1 ring-green-500 focus:border-green-500 focus:ring-green-500'
                    : 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
              >
                <option value="" disabled>Select</option>
                {paymentMethods.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name} {p.show_balance ? `(₹${p.balance})` : ''}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
            </div>
            {balanceValidation && (
              <div className={`mt-2 p-3 rounded-lg flex items-center gap-2 border ${balanceValidation.isSufficient
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                }`}>
                <span className="material-symbols-outlined text-sm">
                  {balanceValidation.isSufficient ? 'check_circle' : 'error'}
                </span>
                <span className="text-xs font-semibold">
                  {balanceValidation.message}
                </span>
              </div>
            )}
          </label>


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
                      <img src={f.url && f.url.startsWith('http://localhost/') && !f.url.includes(':8000') ? f.url.replace('http://localhost/', 'http://localhost:8000/') : f.url} alt="existing" className="w-full h-full object-cover" />
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
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer group transition-all ${loan.include_processing_fee ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} `}>
              <span className="text-gray-800 dark:text-white text-sm font-medium">Include Fee?</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${loan.include_processing_fee ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'} `}>
                {loan.include_processing_fee && <span className="material-symbols-outlined text-white text-xs leading-none">check</span>}
              </div>
              <input
                checked={loan.include_processing_fee}
                onChange={(e) => setLoan({ ...loan, include_processing_fee: e.target.checked })}
                className="hidden"
                type="checkbox"
              />
            </label>

            <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer group transition-all ${loan.interest_taken ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} `}>
              <span className="text-gray-800 dark:text-white text-sm font-medium">Interest Taken?</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${loan.interest_taken ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'} `}>
                {loan.interest_taken && <span className="material-symbols-outlined text-white text-xs leading-none">check</span>}
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

      <div className="mt-2 mb-8 flex justify-center">
        <button type="submit" disabled={isSubmitting} className="flex w-full max-w-sm px-8 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark transition-all h-14 text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          {isSubmitting ? 'Saving...' : 'Save Pledge'}
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
