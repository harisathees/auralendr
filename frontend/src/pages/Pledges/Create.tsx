import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper component for consistent media upload UI
interface MediaUploadBlockProps {
  label: string;
  icon: string; // Material symbol name
  onCamera?: () => void;
  onGallery?: () => void;
  onRecord?: () => void;
  onUpload?: () => void;
  isAudio?: boolean;
}

const MediaUploadBlock: React.FC<MediaUploadBlockProps> = ({
  label, icon, onCamera, onGallery, onRecord, onUpload, isAudio = false
}) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Added h-full to make it fill height if grid used */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 dark:border-gray-700 flex-1 min-h-[140px]">
        <span className="material-symbols-outlined text-gray-400 text-3xl">{icon}</span>
        <div className="flex gap-2">
          {!isAudio ? (
            <>
              <button onClick={onCamera} className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-sm">Camera</button>
              <button onClick={onGallery} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">Gallery</button>
            </>
          ) : (
            <>
              <button onClick={onRecord} className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-sm">Record</button>
              <button onClick={onUpload} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">Upload</button>
            </>
          )}
        </div>
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

// Preview Placeholder Component
const PreviewBlock: React.FC = () => (
  <div className="flex flex-col gap-2 h-full">
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg flex-1 min-h-[140px] flex items-center justify-center border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
      <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:scale-105 transition-transform">
        <span className="material-symbols-outlined text-3xl opacity-50">image_not_supported</span>
        <span className="text-xs font-medium opacity-70">No Media</span>
      </div>
    </div>
    <div className="flex items-center justify-center mt-1">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full opacity-60">
        <span className="material-symbols-outlined text-[16px]">visibility</span>
        <span className="text-xs font-medium">Preview</span>
      </div>
    </div>
  </div>
);

const Create: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [includeFee, setIncludeFee] = useState(true);
  const [interestTaken, setInterestTaken] = useState(false);

  // Weight Calculation State
  const [weight, setWeight] = useState<string>("");
  const [stoneWeight, setStoneWeight] = useState<string>("");
  const [netWeight, setNetWeight] = useState<string>("");
  const [loanNo, setLoanNo] = useState<string>("");

  useEffect(() => {
    const w = parseFloat(weight) || 0;
    const sw = parseFloat(stoneWeight) || 0;
    const net = Math.max(0, w - sw);
    setNetWeight(net > 0 ? net.toFixed(2) : "");
  }, [weight, stoneWeight]);

  // Handler mocks
  const handleCamera = () => console.log("Camera clicked");
  const handleGallery = () => console.log("Gallery clicked");
  const handleRecord = () => console.log("Record clicked");
  const handleAudioUpload = () => console.log("Audio Upload clicked");


  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">

      {/* Header */}
      <header className="flex-none flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 shadow-sm border-b border-border-green/50 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-primary-text dark:text-white">arrow_back</span>
        </button>
        <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Create Pledge</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 p-4 pb-48">

        {/* Customer Details Section */}
        <section className="bg-surface dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-border-green/30">
          <div className="flex items-center gap-3 mb-5 border-b border-border-green/30 pb-3">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h3 className="text-primary-text dark:text-white text-xl font-bold">Customer Details</h3>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Name <span className="text-red-500">*</span></span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Enter full name" type="text" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Mobile No <span className="text-red-500">*</span></span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Enter mobile number" type="tel" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Whatsapp No</span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Enter whatsapp number" type="tel" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Address</span>
              <textarea className="form-textarea w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary p-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm resize-none h-24 outline-none border" placeholder="Enter full address"></textarea>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex flex-col gap-1.5 w-full sm:w-1/3">
                <span className="text-primary-text dark:text-white text-sm font-medium">ID Type</span>
                <div className="relative">
                  <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-primary-text dark:text-white text-sm appearance-none outline-none border">
                    <option>Aadhar</option>
                    <option>PAN Card</option>
                    <option>Voter ID</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>

              <label className="flex flex-col gap-1.5 w-full sm:w-2/3">
                <span className="text-primary-text dark:text-white text-sm font-medium">ID Number</span>
                <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Enter ID number" type="text" />
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-primary-text dark:text-white text-sm font-medium">Upload Document</span>
              <div className="grid grid-cols-2 gap-4 h-full">
                <MediaUploadBlock
                  label="Capture Doc"
                  icon="upload_file"
                  onCamera={handleCamera}
                  onGallery={handleGallery}
                />
                <PreviewBlock />
              </div>
            </div>
          </div>
        </section>

        {/* Jewel Details Section */}
        <section className="bg-surface dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-border-green/30">
          <div className="flex items-center gap-3 mb-5 border-b border-border-green/30 pb-3">
            <span className="material-symbols-outlined text-primary">diamond</span>
            <h3 className="text-primary-text dark:text-white text-xl font-bold">Jewel Details</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Jewel Type <span className="text-red-500">*</span></span>
                <div className="relative">
                  <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none text-gray-500 dark:text-gray-300 outline-none border">
                    <option disabled selected>Select</option>
                    <option>Gold Ring</option>
                    <option>Gold Chain</option>
                    <option>Bangles</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Quality</span>
                <div className="relative">
                  <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none text-gray-500 dark:text-gray-300 outline-none border">
                    <option disabled selected>Select</option>
                    <option>24K</option>
                    <option>22K</option>
                    <option>18K</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Description</span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Item description" type="text" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Pieces</span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="1" type="number" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Weight (g) <span className="text-red-500">*</span></span>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="0.00" step="0.01" type="number"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Stone Weight (g)</span>
                <input
                  value={stoneWeight}
                  onChange={(e) => setStoneWeight(e.target.value)}
                  className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="0.00" step="0.01" type="number"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Net Weight (g)</span>
              <input
                value={netWeight}
                readOnly
                className="form-input w-full rounded-lg border-border-green bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 focus:outline-none h-12 px-4 text-sm cursor-not-allowed outline-none border" placeholder="0.00" step="0.01" type="number"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Faults</span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="Any damage or faults" type="text" />
            </label>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-primary-text dark:text-white text-sm font-medium">Upload Jewel Image</span>
              <div className="grid grid-cols-2 gap-4 h-full">
                <MediaUploadBlock
                  label="Capture Jewel"
                  icon="add_a_photo"
                  onCamera={handleCamera}
                  onGallery={handleGallery}
                />
                <PreviewBlock />
              </div>
            </div>
          </div>
        </section>

        {/* Loan Details Section */}
        <section className="bg-surface dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-border-green/30 mb-20">
          <div className="flex items-center gap-3 mb-5 border-b border-border-green/30 pb-3">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            <h3 className="text-primary-text dark:text-white text-xl font-bold">Loan Details</h3>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Loan No <span className="text-red-500">*</span></span>
              <input
                value={loanNo}
                onChange={(e) => setLoanNo(e.target.value)}
                className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" type="text" placeholder="Enter Loan No"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Estimated Amount</span>
              <input className="form-input w-full rounded-lg border-gray-200 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 focus:outline-none h-12 px-4 text-sm cursor-not-allowed outline-none border" placeholder="₹0" readOnly type="text" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Amount <span className="text-red-500">*</span></span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="₹0" type="number" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Date <span className="text-red-500">*</span></span>
                <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" type="text" defaultValue="13/12/2025" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Due Date</span>
                <input className="form-input w-full rounded-lg border-border-green bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" readOnly type="text" defaultValue="13/03/2026" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Validity Months</span>
                <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" type="number" defaultValue="3" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-primary-text dark:text-white text-sm font-medium">Interest %</span>
                <div className="relative">
                  <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none text-gray-500 dark:text-gray-300 outline-none border">
                    <option disabled selected>Select Interest %</option>
                    <option>1.5%</option>
                    <option>2.0%</option>
                    <option>2.5%</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Payment Method</span>
              <div className="relative">
                <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none text-gray-500 dark:text-gray-300 outline-none border">
                  <option disabled selected>Select Payment Method</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-primary-text dark:text-white text-sm font-medium">Processing Fee</span>
              <input className="form-input w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-gray-400 text-primary-text dark:text-white text-sm outline-none border" placeholder="₹0" type="number" />
            </label>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-primary-text dark:text-white text-sm font-medium">Media Evidence</span>

              {/* Media Evidence - Image Row */}
              <div className="grid grid-cols-2 gap-4 h-full mb-2">
                <MediaUploadBlock
                  label="Capture Image"
                  icon="camera_alt"
                  onCamera={handleCamera}
                  onGallery={handleGallery}
                />
                <PreviewBlock />
              </div>

              {/* Media Evidence - Audio Row */}
              <div className="grid grid-cols-2 gap-4 h-full">
                <MediaUploadBlock
                  label="Capture Audio"
                  icon="mic"
                  isAudio={true}
                  onRecord={handleRecord}
                  onUpload={handleAudioUpload}
                />
                {/* Audio Preview - Maybe different icon? Reuse PreviewBlock for now but user accepted generic */}
                <PreviewBlock />
              </div>
            </div>

            {/* Styled Checkbox Tiles */}
            <div className="flex flex-col gap-3 pt-2">
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer group transition-all ${includeFee ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-border-green/50 dark:border-gray-700'}`}>
                <span className="text-primary-text dark:text-white text-base font-medium">Include Processing Fee?</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${includeFee ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                  {includeFee && <span className="material-symbols-outlined text-white text-sm leading-none">check</span>}
                </div>
                <input
                  checked={includeFee}
                  onChange={(e) => setIncludeFee(e.target.checked)}
                  className="hidden"
                  type="checkbox"
                />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer group transition-all ${interestTaken ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-gray-800 border-border-green/50 dark:border-gray-700'}`}>
                <span className="text-primary-text dark:text-white text-base font-medium">Interest Taken?</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${interestTaken ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}>
                  {interestTaken && <span className="material-symbols-outlined text-white text-sm leading-none">check</span>}
                </div>
                <input
                  checked={interestTaken}
                  onChange={(e) => setInterestTaken(e.target.checked)}
                  className="hidden"
                  type="checkbox"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 mt-2">
              <span className="text-primary-text dark:text-white text-sm font-medium">Status</span>
              <div className="relative">
                <select className="form-select w-full rounded-lg border-border-green bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-3 text-sm appearance-none text-primary-text dark:text-white outline-none border">
                  <option selected>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
              </div>
            </label>

            <div className="flex items-center justify-between bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 mt-2">
              <span className="text-primary-text dark:text-white font-bold text-lg">Amount to be Given</span>
              <span className="text-primary font-extrabold text-2xl tracking-tight">₹0</span>
            </div>

          </div>
        </section>

        <div className="mt-2 mb-8 flex justify-center">
          <button className="flex w-auto min-w-[240px] px-8 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark transition-all h-14 text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98]">
            <span className="material-symbols-outlined">save</span>
            Create Pledge
          </button>
        </div>

      </main>

    </div >
  );
};

export default Create;
