import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  data: any;
}

const PledgeView: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  const { customer, loan, jewels = [], media = [] } = data;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Pledge Details</h2>
        <button onClick={() => navigate(`/pledges/${data.id}/edit`)} className="p-2 rounded-full hover:bg-gray-100 text-primary">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Customer */}
        <section className="bg-white rounded-xl p-5 shadow border">
          <h3 className="font-bold text-lg mb-3">Customer Details</h3>

          <Info label="Name" value={customer.name} />
          <Info label="Mobile" value={customer.mobile_no} />
          <Info label="WhatsApp" value={customer.whatsapp_no} />
          <Info label="Address" value={customer.address} />
          <Info label="ID Proof" value={`${customer.id_proof_type} - ${customer.id_proof_number}`} />
        </section>

        {/* Jewels */}
        <section className="bg-white rounded-xl p-5 shadow border">
          <h3 className="font-bold text-lg mb-3">Jewel Details</h3>

          {jewels.map((j: any, i: number) => (
            <div key={i} className="border rounded-lg p-4 mb-3 bg-gray-50">
              <Info label="Type" value={j.jewel_type} />
              <Info label="Quality" value={j.quality} />
              <Info label="Pieces" value={j.pieces} />
              <Info label="Weight" value={`${j.weight} g`} />
              <Info label="Stone Weight" value={`${j.stone_weight} g`} />
              <Info label="Net Weight" value={`${j.net_weight} g`} />
              <Info label="Faults" value={j.faults || "—"} />
            </div>
          ))}
        </section>

        {/* Loan */}
        <section className="bg-white rounded-xl p-5 shadow border">
          <h3 className="font-bold text-lg mb-3">Loan Details</h3>

          <Info label="Loan No" value={loan.loan_no} />
          <Info label="Amount" value={`₹${loan.amount}`} />
          <Info label="Interest %" value={loan.interest_percentage} />
          <Info label="Validity" value={`${loan.validity_months} months`} />
          <Info label="Due Date" value={loan.due_date} />
          <Info label="Payment Method" value={loan.payment_method} />
          <Info label="Processing Fee" value={`₹${loan.processing_fee}`} />
          <Info label="Amount Given" value={`₹${loan.amount_to_be_given}`} />
        </section>

        {/* Media */}
        <section className="bg-white rounded-xl p-5 shadow border">
          <h3 className="font-bold text-lg mb-3">Media Evidence</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((m: any) => (
              <div key={m.id} className="border rounded p-2">
                {m.type === "image" ? (
                  <img src={m.url} className="w-full h-32 object-cover rounded" />
                ) : (
                  <audio controls className="w-full">
                    <source src={m.url} />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between text-sm py-1 border-b last:border-b-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value || "—"}</span>
  </div>
);

export default PledgeView;
