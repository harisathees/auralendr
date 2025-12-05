import React, { useState, useEffect } from "react";
import FormField from "../../Shared/FormField";
import FileUploader from "../../Shared/FileUploader";

interface Props {
  initial?: any;
  onSubmit: (fd: FormData) => Promise<any>;
}

const PledgeForm: React.FC<Props> = ({ initial, onSubmit }) => {
  const [customer, setCustomer] = useState(
    initial?.customer ?? {
      name: "",
      mobile_no: "",
      whatsapp_no: "",
      address: "",
      sub_address: "",
      id_proof_type: "",
      id_proof_number: "",
    }
  );

  const [loan, setLoan] = useState(
    initial?.loan ?? {
      loan_no: "",
      date: "",
      amount: "",
      interest_percentage: "",
      validity_months: "",
      due_date: "",
      payment_method: "",
      processing_fee: "",
      estimated_amount: "",
      include_processing_fee: false,
      interest_taken: false,
      amount_to_be_given: "",
    }
  );

  const [jewels, setJewels] = useState<any[]>(initial?.jewels ?? []);
  const [files, setFiles] = useState<File[]>([]);

  // New state for existing files and deletion
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  useEffect(() => {
    if (initial?.media) {
      setExistingFiles(initial.media);
    }
    if (initial?.jewels) {
      setJewels(initial.jewels);
    }
    if (initial?.customer) {
      setCustomer(initial.customer);
    }
    if (initial?.loan) {
      setLoan(initial.loan);
    }
  }, [initial]);

  const addJewel = () => {
    setJewels([
      ...jewels,
      { jewel_type: "", quality: "", description: "", pieces: 1, weight: "", stone_weight: "", net_weight: "", faults: "" },
    ]);
  };

  const updateJewel = (index: number, field: string, value: any) => {
    const updated = [...jewels];
    updated[index][field] = value;
    setJewels(updated);
  };

  const removeJewel = (index: number) => {
    const updated = [...jewels];
    updated.splice(index, 1);
    setJewels(updated);
  };

  const removeExistingFile = (fileId: number) => {
    setExistingFiles(existingFiles.filter(f => f.id !== fileId));
    setDeletedFileIds([...deletedFileIds, fileId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    Object.entries(customer).forEach(([k, v]) =>
      fd.append(`customer[${k}]`, String(v ?? ""))
    );
    Object.entries(loan).forEach(([k, v]) => {
      // Handle boolean values specifically
      if (typeof v === 'boolean') {
        fd.append(`loan[${k}]`, v ? '1' : '0');
      } else {
        fd.append(`loan[${k}]`, String(v ?? ""));
      }
    });

    jewels.forEach((j, idx) => {
      // Include ID if present to update existing jewel
      if (j.id) {
        fd.append(`jewels[${idx}][id]`, String(j.id));
      }
      Object.entries(j).forEach(([k, v]) => {
        if (k !== 'id') { // Avoid duplicating ID
          fd.append(`jewels[${idx}][${k}]`, String(v ?? ""))
        }
      });
    });

    files.forEach((f) => {
      fd.append("files[]", f);
    });

    // Append deleted file IDs
    deletedFileIds.forEach((id) => {
      fd.append("deleted_file_ids[]", String(id));
    });

    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-4 bg-white shadow rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Info</h2>
          <div className="space-y-3">
            <FormField label="Name" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} />
            <FormField label="Mobile" value={customer.mobile_no} onChange={(v) => setCustomer({ ...customer, mobile_no: v })} />
            <FormField label="WhatsApp" value={customer.whatsapp_no} onChange={(v) => setCustomer({ ...customer, whatsapp_no: v })} />
            <FormField label="Address" value={customer.address} onChange={(v) => setCustomer({ ...customer, address: v })} />
            <FormField label="Sub Address" value={customer.sub_address} onChange={(v) => setCustomer({ ...customer, sub_address: v })} />
            <FormField label="ID Proof Type" value={customer.id_proof_type} onChange={(v) => setCustomer({ ...customer, id_proof_type: v })} />
            <FormField label="ID Proof Number" value={customer.id_proof_number} onChange={(v) => setCustomer({ ...customer, id_proof_number: v })} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Loan Info</h2>
          <div className="space-y-3">
            <FormField label="Loan No" value={loan.loan_no} onChange={(v) => setLoan({ ...loan, loan_no: v })} />
            <FormField label="Date" type="date" value={loan.date} onChange={(v) => setLoan({ ...loan, date: v })} />
            <FormField label="Amount" value={loan.amount} onChange={(v) => setLoan({ ...loan, amount: v })} />
            <FormField label="Interest %" value={loan.interest_percentage} onChange={(v) => setLoan({ ...loan, interest_percentage: v })} />
            <FormField label="Validity (Months)" value={loan.validity_months} onChange={(v) => setLoan({ ...loan, validity_months: v })} />
            <FormField label="Due Date" type="date" value={loan.due_date} onChange={(v) => setLoan({ ...loan, due_date: v })} />
            <FormField label="Payment Method" value={loan.payment_method} onChange={(v) => setLoan({ ...loan, payment_method: v })} />
            <FormField label="Processing Fee" value={loan.processing_fee} onChange={(v) => setLoan({ ...loan, processing_fee: v })} />
            <FormField label="Estimated Amount" value={loan.estimated_amount} onChange={(v) => setLoan({ ...loan, estimated_amount: v })} />
            <FormField label="Amount to be Given" value={loan.amount_to_be_given} onChange={(v) => setLoan({ ...loan, amount_to_be_given: v })} />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include_processing_fee"
                checked={loan.include_processing_fee}
                onChange={(e) => setLoan({ ...loan, include_processing_fee: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="include_processing_fee" className="text-sm text-gray-700">Include Processing Fee</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="interest_taken"
                checked={loan.interest_taken}
                onChange={(e) => setLoan({ ...loan, interest_taken: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="interest_taken" className="text-sm text-gray-700">Interest Taken</label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Jewel Items</h2>
        {jewels.map((j, i) => (
          <div key={i} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
            <button
              type="button"
              onClick={() => removeJewel(i)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
            >
              Remove
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Type" value={j.jewel_type} onChange={(v) => updateJewel(i, "jewel_type", v)} />
              <FormField label="Quality" value={j.quality} onChange={(v) => updateJewel(i, "quality", v)} />
              <FormField label="Pieces" value={j.pieces} onChange={(v) => updateJewel(i, "pieces", v)} />
              <FormField label="Total Weight" value={j.weight} onChange={(v) => updateJewel(i, "weight", v)} />
              <FormField label="Stone Weight" value={j.stone_weight} onChange={(v) => updateJewel(i, "stone_weight", v)} />
              <FormField label="Net Weight" value={j.net_weight} onChange={(v) => updateJewel(i, "net_weight", v)} />
              <FormField label="Description" value={j.description} onChange={(v) => updateJewel(i, "description", v)} />
              <FormField label="Faults" value={j.faults} onChange={(v) => updateJewel(i, "faults", v)} />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addJewel}
          className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
        >
          + Add Jewel
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Files</h2>

        {/* Existing Files */}
        {existingFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Existing Files</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingFiles.map((f) => (
                <div key={f.id} className="relative group border rounded p-2">
                  <button
                    type="button"
                    onClick={() => removeExistingFile(f.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 z-10"
                    title="Delete file"
                  >
                    &times;
                  </button>
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden rounded mb-2">
                    {f.type === 'image' ? (
                      <img src={f.url} alt="preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-xs uppercase">{f.type}</span>
                    )}
                  </div>
                  <div className="text-xs truncate text-gray-600" title={f.original_name}>{f.original_name || 'File'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <FileUploader onFilesSelected={(f) => setFiles(f)} />
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-colors"
        >
          Save Pledge
        </button>
      </div>
    </form>
  );
};

export default PledgeForm;
