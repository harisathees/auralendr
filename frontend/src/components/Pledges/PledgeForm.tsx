import React, { useState, useRef, useEffect, useMemo } from "react";
import api from "../../api/apiClient";
// import { AudioRecorder } from "../audiocamera/AudioRecorder";
// import { CameraCapture } from "../audiocamera/CameraCapture";
import { useAuth } from "../../context/Auth/AuthContext";
import { compressImage } from "../../utils/imageCompression";
import SecureImage from "../Shared/AudioAndImageFetch/SecureImage";
import SecureAudio from "../Shared/AudioAndImageFetch/SecureAudio";
import ConfirmationModal from "../Shared/ConfirmationModal";
import CustomDropdown from "../Shared/CustomDropdown";

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
  mediaId?: number | null;
  onRemove?: () => void;
}

const MediaUploadBlock: React.FC<MediaUploadBlockProps> = ({
  label, icon, onCamera, onGallery, onRecord, onUpload, isAudio = false, file, existingUrl, mediaId, onRemove
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
        ) : existingUrl || mediaId ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {isAudio ? (
              <div className="w-full flex justify-center">
                <SecureAudio
                  mediaId={mediaId}
                  fallbackSrc={existingUrl}
                  className="w-full max-w-[200px]"
                />
              </div>
            ) : (
              <SecureImage
                mediaId={mediaId}
                fallbackSrc={existingUrl}
                alt="existing"
                className="w-full h-full object-cover rounded-lg"
              />
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
  const { user: _user, enableEstimatedAmount } = useAuth(); // Get current user (and branch_id)

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    if (_user?.role === 'admin' || _user?.role === 'superadmin' || _user?.role === 'developer') {
      api.get('/branches').then(res => {
        setBranches(res.data);
        if (initial?.branch_id) {
          setSelectedBranchId(String(initial.branch_id));
        } else if (_user.branch_id) {
          setSelectedBranchId(String(_user.branch_id));
        }
      });
    }
  }, [_user, initial]);

  // --- State ---

  // Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'doc' | 'jewel' | 'evidence' | 'customer_image' | null>(null);

  // Handlers for Modals
  const [expandedJewelIndex, setExpandedJewelIndex] = useState<number>(0);
  const [currentJewelIndex, setCurrentJewelIndex] = useState<number | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jewelToDelete, setJewelToDelete] = useState<number | null>(null);

  const handleDeleteJewelClick = (index: number) => {
    setJewelToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteJewel = () => {
    if (jewelToDelete === null) return;

    const updated = [...jewels];
    updated.splice(jewelToDelete, 1);
    setJewels(updated);

    // Adjust expanded index if needed
    if (expandedJewelIndex === jewelToDelete) {
      setExpandedJewelIndex(Math.max(0, jewelToDelete - 1));
    } else if (expandedJewelIndex > jewelToDelete) {
      setExpandedJewelIndex(expandedJewelIndex - 1);
    }

    // Remove jewel file if exists
    const newFiles = { ...jewelFiles };
    if (newFiles[jewelToDelete]) {
      delete newFiles[jewelToDelete];
      setJewelFiles(newFiles);
    }

    // Handle existing file removal if needed (logic from original delete)
    const existing = existingFiles.find(f => f.jewel_id === jewels[jewelToDelete].id);
    if (existing) {
      removeExistingFile(existing.id);
    }


    setIsDeleteModalOpen(false);
    setJewelToDelete(null);
  };

  const openCamera = (slot: 'doc' | 'jewel' | 'customer_image', index?: number) => {
    setActiveSlot(slot);
    if (index !== undefined) setCurrentJewelIndex(index);
    setIsCameraOpen(true);
  };

  const openAudio = () => {
    setActiveSlot('evidence');
    setIsAudioOpen(true);
  };

  const handleCapture = (file: File) => {
    if (activeSlot === 'doc') setDocFile(file);
    if (activeSlot === 'jewel' && currentJewelIndex !== null) {
      setJewelFiles(prev => ({ ...prev, [currentJewelIndex]: file }));
    }
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
      const res = await api.get(`/customers/search?query=${query}`);
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
    post_validity_interest: initial?.loan?.post_validity_interest ?? "2%",
    validity_months: initial?.loan?.validity_months ?? "3",
    due_date: initial?.loan?.due_date ?? "",
    payment_method: initial?.loan?.payment_method ?? "Cash",
    processing_fee: initial?.loan?.processing_fee ?? "",
    estimated_amount: initial?.loan?.estimated_amount ?? "",
    include_processing_fee: initial?.loan?.include_processing_fee ?? true,
    interest_taken: initial?.loan?.interest_taken ?? false,
    amount_to_be_given: initial?.loan?.amount_to_be_given ?? "",
    metal_rate: initial?.loan?.metal_rate ?? "",
    calculation_method: initial?.loan?.calculation_method ?? "",
  });

  // Jewels (Array)
  // We strictly initialize with at least one item if empty
  const [jewels, setJewels] = useState<any[]>(initial?.jewels?.length ? initial.jewels : [{
    jewel_type: "", quality: "", description: "", pieces: 1, weight: "", stone_weight: "", weight_reduction: "", net_weight: "", faults: ""
  }]);

  // Files - 3 Distinct Slots
  // Files - 3 Distinct Slots
  const [docFile, setDocFile] = useState<File | null>(null);
  // Replaced single jewelFile with Map for per-jewel files
  const [jewelFiles, setJewelFiles] = useState<{ [key: number]: File }>({});
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const [customerImageFile, setCustomerImageFile] = useState<File | null>(null);

  // Fetched URLs from Customer Search
  const [fetchedDocUrl, setFetchedDocUrl] = useState<string | null>(null);


  // Existing Media (for Edit mode)
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  // Derived state for specific slots
  const existingDoc = useMemo(() => existingFiles.find(f => f.category === 'customer_document'), [existingFiles]);

  const existingEvidence = useMemo(() => existingFiles.find(f => f.category === 'evidence_media'), [existingFiles]);
  const existingCustomerImage = useMemo(() => existingFiles.find(f => f.category === 'customer_image'), [existingFiles]);

  // Remaining files (generic uploads)
  const remainingFiles = useMemo(() => existingFiles.filter(f =>
    !['customer_document', 'jewel_image', 'evidence_media', 'customer_image'].includes(f.category)
  ), [existingFiles]);

  // Metadata Options
  const jewelSummary = useMemo(() => {
    if (jewels.length <= 1) return null;
    return jewels.reduce((acc, j) => ({
      totalWeight: acc.totalWeight + (parseFloat(j.weight) || 0),
      totalPieces: acc.totalPieces + (parseInt(j.pieces) || 0),
      totalStoneWeight: acc.totalStoneWeight + (parseFloat(j.stone_weight) || 0),
      totalWeightReduction: acc.totalWeightReduction + (parseFloat(j.weight_reduction) || 0),
      totalNetWeight: acc.totalNetWeight + (parseFloat(j.net_weight) || 0),
    }), { totalWeight: 0, totalPieces: 0, totalStoneWeight: 0, totalWeightReduction: 0, totalNetWeight: 0 });
  }, [jewels]);

  // Metadata Options
  // Metadata Options
  const [jewelTypes, setJewelTypes] = useState<{ id: number; name: string }[]>([]);
  const [jewelQualities, setJewelQualities] = useState<{ id: number; name: string }[]>([]);
  const [jewelNames, setJewelNames] = useState<{ id: number; name: string }[]>([]);
  const [activeSearchJewelIndex, setActiveSearchJewelIndex] = useState<number | null>(null);

  // Validation State
  const [mobileError, setMobileError] = useState<boolean>(false);
  const [whatsappError, setWhatsappError] = useState<boolean>(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const jewelInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const customerImageInputRef = useRef<HTMLInputElement>(null);

  // Loan Configs
  const [interestRates, setInterestRates] = useState<{ id: number; rate: string; jewel_type_id?: number | null; estimation_percentage?: string; post_validity_rate?: string }[]>([]);
  const [loanValidities, setLoanValidities] = useState<{ id: number; months: number; label?: string; jewel_type_id?: number | null }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string; balance: string; show_balance: boolean; is_outbound?: boolean }[]>([]);
  const [metalRates, setMetalRates] = useState<{ name: string; metal_rate?: { rate: string } }[]>([]);
  const [processingFeesConfigs, setProcessingFeesConfigs] = useState<{ jewel_type_id: number; percentage: string; max_amount: string | null }[]>([]);
  const [loanSchemes, setLoanSchemes] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [enableTransactions, setEnableTransactions] = useState(true);

  // --- Effects ---

  // Fetch global processing fees
  useEffect(() => {
    api.get(`/processing-fees`)
      .then(res => setProcessingFeesConfigs(res.data))
      .catch(console.error);
  }, []);
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
    if (!metalRates.length || !interestRates.length || !enableEstimatedAmount) return;

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
    if (loanSchemes.length > 0 && !loan.calculation_method) {
      setLoan(prev => ({ ...prev, calculation_method: loanSchemes[0].slug }));
    }
  }, [loanSchemes, loan.calculation_method]);

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
    api.get("/jewel-types").then(res => Array.isArray(res.data) && setJewelTypes(res.data)).catch(console.error);
    api.get("/jewel-qualities").then(res => Array.isArray(res.data) && setJewelQualities(res.data)).catch(console.error);
    api.get("/jewel-names").then(res => Array.isArray(res.data) && setJewelNames(res.data)).catch(console.error);
    api.get("/interest-rates").then(res => Array.isArray(res.data) && setInterestRates(res.data)).catch(console.error);
    api.get("/loan-validities").then(res => Array.isArray(res.data) && setLoanValidities(res.data)).catch(console.error);
    api.get("/money-sources").then(res => {
      if (Array.isArray(res.data)) {
        setPaymentMethods(res.data.filter((m: any) => m.is_outbound));
      }
    }).catch(console.error);
    api.get("/metal-rates").then(res => Array.isArray(res.data) && setMetalRates(res.data)).catch(console.error); // Added this line
    api.get("/loan-schemes?status=active").then(res => Array.isArray(res.data) && setLoanSchemes(res.data)).catch(console.error);
    api.get("/developer/settings").then(res => setEnableTransactions(!!res.data.enable_transactions)).catch(() => setEnableTransactions(true));
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

  const handleJewelFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJewelFiles(prev => ({ ...prev, [index]: file }));
    }
  };

  const removeExistingFile = (id: number) => {
    setExistingFiles(prev => prev.filter(f => f.id !== id));
    setDeletedFileIds(prev => [...prev, id]);
  };

  const updateJewel = (index: number, field: string, value: any) => {
    const updated = [...jewels];
    updated[index][field] = value;

    // Sync jewel type if first jewel is updated
    if (index === 0 && field === 'jewel_type') {
      updated.forEach((j, i) => {
        if (i > 0) j.jewel_type = value;
      });
    }

    // Auto calc net weight
    if (field === 'weight' || field === 'stone_weight' || field === 'weight_reduction') {
      const w = parseFloat(field === 'weight' ? value : updated[index].weight) || 0;
      const sw = parseFloat(field === 'stone_weight' ? value : updated[index].stone_weight) || 0;
      const wr = parseFloat(field === 'weight_reduction' ? value : updated[index].weight_reduction) || 0;
      updated[index].net_weight = (Math.max(0, w - sw - wr)).toFixed(2);
    }

    setJewels(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    // Customer
    if (customerId) fd.append("customer_id", customerId);
    if (selectedBranchId) fd.append("branch_id", selectedBranchId); // Append Branch ID
    Object.entries(customer).forEach(([k, v]) => {
      let value = String(v ?? "");

      // Auto-append +91 for mobile and whatsapp numbers
      if ((k === 'mobile_no' || k === 'whatsapp_no') && value.length === 10 && /^\d{10}$/.test(value)) {
        value = `+91${value}`;
      }

      fd.append(`customer[${k}]`, value);
    });

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

    // Process Jewel Files
    for (const [index, file] of Object.entries(jewelFiles)) {
      const compressed = await compressImage(file);
      fd.append(`jewel_files[${index}]`, compressed);
    }

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
      {/* Jewel Input Ref is now dynamic or managed differently, or we use a single ref and track active index. 
          For simplicity, we can just click a specific ref if we want, or use the same ref and store 'active index' in state before clicking.
      */}
      <input type="file" ref={jewelInputRef} className="hidden" accept="image/*" onChange={(e) => currentJewelIndex !== null && handleJewelFileSelect(e, currentJewelIndex)} />
      <input type="file" ref={evidenceInputRef} className="hidden" accept="image/*,audio/*,video/*" onChange={(e) => handleFileSelect(e, setEvidenceFile)} />
      <input type="file" ref={customerImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setCustomerImageFile)} />


      <input type="file" ref={customerImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setCustomerImageFile)} />

      {/* Branch Selection (Admin Only) */}
      {branches.length > 0 && (
        <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-purple-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
            <span className="material-symbols-outlined">store</span>
            <h3 className="font-bold text-lg">Branch Details</h3>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Select Branch</span>
            <div className="relative">
              <CustomDropdown
                value={selectedBranchId}
                onChange={(val: string) => setSelectedBranchId(val)}
                options={branches.map(b => ({ value: b.id.toString(), label: b.branch_name }))}
                placeholder="Select a Branch"
                className="h-12"
              />
            </div>
          </label>
        </section>
      )}


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
            <div className={`relative flex items-center rounded-lg border bg-white dark:bg-gray-800 transition-all ${mobileError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
              }`}>

              <input
                value={customer.mobile_no}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCustomer({ ...customer, mobile_no: val });
                  setMobileError(val.length > 0 && val.length < 10);
                  searchCustomer(val, 'mobile');
                }}
                onBlur={() => {
                  clearSuggestions();
                  setMobileError(customer.mobile_no.length > 0 && customer.mobile_no.length < 10);
                }}
                className="w-full h-12 px-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Enter 10-digit number" type="tel" required
              />
              {mobileError && (
                <span className="material-symbols-outlined text-red-500 text-lg pr-3 animate-in zoom-in">error</span>
              )}
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
            <div className={`relative flex items-center rounded-lg border bg-white dark:bg-gray-800 transition-all ${whatsappError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
              }`}>

              <input
                value={customer.whatsapp_no}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCustomer({ ...customer, whatsapp_no: val });
                  setWhatsappError(val.length > 0 && val.length < 10);
                  searchCustomer(val, 'whatsapp');
                }}
                onBlur={() => {
                  clearSuggestions();
                  setWhatsappError(customer.whatsapp_no.length > 0 && customer.whatsapp_no.length < 10);
                }}
                className="w-full h-12 px-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Enter 10-digit number" type="tel"
              />
              {whatsappError && (
                <span className="material-symbols-outlined text-red-500 text-lg pr-3 animate-in zoom-in">error</span>
              )}
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
                existingUrl={fetchedDocUrl ? (fetchedDocUrl.startsWith('http://localhost/') && !fetchedDocUrl.includes(':8000') ? fetchedDocUrl.replace('http://localhost/', 'http://localhost:8000/') : fetchedDocUrl) : (existingDoc?.url ? (existingDoc.url.startsWith('http://localhost/') && !existingDoc.url.includes(':8000') ? existingDoc.url.replace('http://localhost/', 'http://localhost:8000/') : existingDoc.url) : null)}
                mediaId={existingDoc?.id}
                onRemove={() => {
                  if (existingDoc) removeExistingFile(existingDoc.id);
                  setDocFile(null);
                  setFetchedDocUrl(null);
                }}
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
          <div key={index} className={`${jewels.length > 1 ? 'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-6' : ''} relative`}>
            {jewels.length > 1 && (
              <div
                className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-lg transition-colors border mb-2 ${expandedJewelIndex === index
                  ? 'bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30'
                  : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 border-gray-100 dark:border-gray-700'
                  }`}
                onClick={() => setExpandedJewelIndex(expandedJewelIndex === index ? -1 : index)}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJewelClick(index);
                  }} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors" title="Remove Jewel">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <span className={`transition-colors ${expandedJewelIndex === index ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                    {jewel.quality || "—"} {jewel.description || "—"}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">-</span>
                  <span className={`${expandedJewelIndex === index ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                    {jewel.pieces || "0"}pc
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">---&gt;</span>
                  <span className={`font-bold ${expandedJewelIndex === index ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                    {jewel.net_weight || "0"}g
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${expandedJewelIndex === index ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
                </div>
              </div>
            )
            }

            {/* Expanded View: Form Fields (Animated) */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${(jewels.length === 1 || expandedJewelIndex === index)
              ? 'opacity-100 max-h-[1200px] mt-2'
              : 'opacity-0 max-h-0 mt-0'
              }`}>
              <div className={`${jewels.length > 1 ? 'p-2' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Jewel Type <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <select
                        value={jewel.jewel_type} onChange={e => updateJewel(index, 'jewel_type', e.target.value)}
                        required
                        disabled={index > 0}
                        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all ${index > 0 ? 'opacity-70 bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
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

                <div className="relative z-50 mt-4">
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

                <label className="flex flex-col gap-1.5 mt-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Pieces</span>
                  <input
                    value={jewel.pieces} onChange={e => updateJewel(index, 'pieces', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400"
                    placeholder="1" type="number"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Weight (g) <span className="text-red-500">*</span></span>
                    <input
                      value={jewel.weight ?? ""} onChange={e => updateJewel(index, 'weight', e.target.value)}
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

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Weight Reduction</span>
                    <input
                      value={jewel.weight_reduction ?? ""} onChange={e => updateJewel(index, 'weight_reduction', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" placeholder="0.00" step="0.01" type="number"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Net Weight (g)</span>
                    <input
                      value={jewel.net_weight ?? ""} readOnly
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 h-12 px-4 shadow-sm outline-none transition-all cursor-not-allowed" placeholder="0.00"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5 mt-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Faults / Remarks</span>
                  <textarea
                    value={jewel.faults ?? ""} onChange={e => updateJewel(index, 'faults', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary p-4 shadow-sm resize-none h-20 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Describe any damage"
                  ></textarea>
                </label>
                {/* Per-Jewel Image Upload */}
                <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                  <div className="h-52 w-full">
                    <MediaUploadBlock
                      label={`Jewel ${index + 1} Image`}
                      icon="diamond"
                      file={jewelFiles[index]}
                      // Find existing media for this jewel
                      existingUrl={existingFiles.find(f => f.jewel_id === jewel.id)?.url}
                      mediaId={existingFiles.find(f => f.jewel_id === jewel.id)?.id}
                      onRemove={() => {
                        const existing = existingFiles.find(f => f.jewel_id === jewel.id);
                        if (existing) removeExistingFile(existing.id);
                        const newFiles = { ...jewelFiles };
                        delete newFiles[index];
                        setJewelFiles(newFiles);
                      }}
                      onGallery={() => {
                        setCurrentJewelIndex(index);
                        setTimeout(() => jewelInputRef.current?.click(), 0);
                      }}
                      onCamera={() => openCamera('jewel', index)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {jewelSummary && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-xl">diamond</span>
              <h4 className="text-gray-800 dark:text-white font-bold text-base">Jewel Summary</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Gross Wt</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{jewelSummary.totalWeight.toFixed(2)} g</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Pieces</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{jewelSummary.totalPieces}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Stone Wt</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{jewelSummary.totalStoneWeight.toFixed(2)} g</span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Reduction</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{jewelSummary.totalWeightReduction.toFixed(2)} g</span>
              </div>

              <div className="flex flex-col col-span-2 md:col-span-1 md:items-end md:text-right border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-4 mt-1 md:mt-0">
                <span className="text-xs text-primary font-bold uppercase tracking-wide">Net Weight</span>
                <span className="text-2xl font-extrabold text-primary">{jewelSummary.totalNetWeight.toFixed(2)} g</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              const firstJewelType = jewels.length > 0 ? jewels[0].jewel_type : "";
              const newJewels = [...jewels, { jewel_type: firstJewelType, quality: "", description: "", pieces: 1, weight: "", stone_weight: "", weight_reduction: "", net_weight: "", faults: "" }];
              setJewels(newJewels);
              setExpandedJewelIndex(newJewels.length - 1);
            }}
            className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-xl">add</span>
            </div>
            <span className="text-primary font-bold text-sm">Add Another Jewel</span>
          </button>
        </div>
      </section>

      {/* Loan Details Section */}
      <section
        className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-green-100 dark:border-gray-700 mb-20"
        onClickCapture={() => setExpandedJewelIndex(-1)}
      >
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
              existingUrl={existingEvidence?.url ? (existingEvidence.url.startsWith('http://localhost/') && !existingEvidence.url.includes(':8000') ? existingEvidence.url.replace('http://localhost/', 'http://localhost:8000/') : existingEvidence.url) : null}
              mediaId={existingEvidence?.id}
              onRemove={() => {
                if (existingEvidence) removeExistingFile(existingEvidence.id);
                setEvidenceFile(null);
              }}
              onUpload={() => evidenceInputRef.current?.click()}
              onRecord={() => openAudio()}
            />
            <MediaUploadBlock
              label="Customer Image"
              icon="account_box"
              file={customerImageFile}
              existingUrl={existingCustomerImage?.url ? (existingCustomerImage.url.startsWith('http://localhost/') && !existingCustomerImage.url.includes(':8000') ? existingCustomerImage.url.replace('http://localhost/', 'http://localhost:8000/') : existingCustomerImage.url) : null}
              mediaId={existingCustomerImage?.id}
              onRemove={() => {
                if (existingCustomerImage) removeExistingFile(existingCustomerImage.id);
                setCustomerImageFile(null);
              }}
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

            {enableEstimatedAmount && (
              <label className="flex flex-col gap-1.5 w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Estimated Amount</span>
                <input
                  value={loan.estimated_amount}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400 text-sm cursor-not-allowed" placeholder="₹0" type="number"
                />
              </label>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Processing Fee</span>
            <input
              value={loan.processing_fee} onChange={e => setLoan({ ...loan, processing_fee: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 shadow-sm outline-none transition-all placeholder:text-gray-400" placeholder="₹0" type="number"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Scheme</span>
            <div className="relative">
              <select
                value={loan.calculation_method}
                onChange={e => setLoan({ ...loan, calculation_method: e.target.value })}
                className="w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all border-primary ring-1 ring-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/50"
              >
                <option value="" disabled>Select Scheme</option>
                {loanSchemes.map(s => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-primary text-sm">expand_more</span>
            </div>
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
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Interest % <span className="text-red-500">*</span></span>
              <div className="relative">
                <select
                  value={loan.interest_percentage}
                  onChange={e => {
                    const newInterest = e.target.value;

                    // Find the selected interest rate object to get its configured post_validity_rate
                    const selectedRate = filteredInterestOptions.find(r => `${parseFloat(r.rate)}%` === newInterest);

                    setLoan({
                      ...loan,
                      interest_percentage: newInterest,
                      post_validity_interest: selectedRate?.post_validity_rate ? `${parseFloat(selectedRate.post_validity_rate)}%` : loan.post_validity_interest
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                  required
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
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Post Validity Interest % <span className="text-red-500">*</span></span>
            <div className="relative">
              <select
                value={loan.post_validity_interest}
                onChange={e => setLoan({ ...loan, post_validity_interest: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none shadow-sm outline-none transition-all"
                required
              >
                <option value="" disabled>Select</option>
                {Array.from(
                  new Set(
                    filteredInterestOptions
                      .filter(r => r.post_validity_rate)
                      .map(r => parseFloat(r.post_validity_rate || "0"))
                  )
                )
                  .sort((a, b) => a - b)
                  .map(rate => (
                    <option key={rate} value={`${rate}%`}>
                      {rate}%
                    </option>
                  ))
                }
              </select>
              <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Interest rate applied after validity period expires</span>
          </label>

          {enableTransactions && (
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
          )}


          {/* Existing Files Display (for Edit Mode) */}
          {remainingFiles.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Other Files</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {remainingFiles.map((f) => (
                  <div key={f.id} className="relative group border rounded-xl overflow-hidden aspect-square border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => removeExistingFile(f.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 z-10"
                    >&times;</button>
                    {f.type === 'image' ? (
                      <SecureImage
                        mediaId={f.id}
                        fallbackSrc={f.url && f.url.startsWith('http://localhost/') && !f.url.includes(':8000') ? f.url.replace('http://localhost/', 'http://localhost:8000/') : f.url}
                        alt="existing"
                        className="w-full h-full object-cover"
                      />
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
      {/* <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      <AudioRecorder
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        onCapture={handleCapture}
      /> */}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Jewel?"
        message="Are you sure you want to remove this jewel item? This action cannot be undone."
        confirmLabel="Delete"
        isDangerous={true}
        onConfirm={confirmDeleteJewel}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

    </form >
  );
};

export default PledgeForm;
