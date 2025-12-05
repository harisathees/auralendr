import React from "react";
import { Link } from "react-router-dom";

interface Props {
  pledge: any;
}

const PledgeView: React.FC<Props> = ({ pledge }) => {
  if (!pledge) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pledge Details</h1>
          <p className="text-gray-500">Reference: #{pledge.id}</p>
        </div>
        <div className="space-x-4">
          <Link
            to="/pledges"
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Back to List
          </Link>
          <Link
            to={`/pledges/${pledge.id}/edit`}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow"
          >
            Edit Pledge
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Customer Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Customer Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{pledge.customer?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="font-medium">{pledge.customer?.mobile_no}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-medium text-right">{pledge.customer?.address}</span></div>
          </div>
        </div>

        {/* Loan Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b border-blue-200 pb-2">Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-blue-600">Loan No:</span> <span className="font-medium">{pledge.loan?.loan_no}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Date:</span> <span className="font-medium">{pledge.loan?.date}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Amount:</span> <span className="font-bold text-lg">₹{pledge.loan?.amount}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Interest:</span> <span className="font-medium">{pledge.loan?.interest_percentage}%</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Validity:</span> <span className="font-medium">{pledge.loan?.validity_months} Months</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Due Date:</span> <span className="font-medium">{pledge.loan?.due_date}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-blue-600">Payment Method:</span> <span className="font-medium">{pledge.loan?.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Processing Fee:</span> <span className="font-medium">₹{pledge.loan?.processing_fee}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Estimated Amount:</span> <span className="font-medium">₹{pledge.loan?.estimated_amount}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Amount Given:</span> <span className="font-bold text-lg">₹{pledge.loan?.amount_to_be_given}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Processing Fee Included:</span> <span className="font-medium">{pledge.loan?.include_processing_fee ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Interest Taken:</span> <span className="font-medium">{pledge.loan?.interest_taken ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Jewels Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Jewels</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Type</th>
                <th className="py-3 px-6 text-left">Quality</th>
                <th className="py-3 px-6 text-center">Pieces</th>
                <th className="py-3 px-6 text-center">Total Wt (g)</th>
                <th className="py-3 px-6 text-center">Stone Wt (g)</th>
                <th className="py-3 px-6 text-center">Net Wt (g)</th>
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-left">Faults</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {pledge.jewels?.map((j: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{j.jewel_type}</td>
                  <td className="py-3 px-6 text-left">{j.quality}</td>
                  <td className="py-3 px-6 text-center">{j.pieces}</td>
                  <td className="py-3 px-6 text-center">{j.weight}</td>
                  <td className="py-3 px-6 text-center">{j.stone_weight}</td>
                  <td className="py-3 px-6 text-center">{j.net_weight}</td>
                  <td className="py-3 px-6 text-left">{j.description}</td>
                  <td className="py-3 px-6 text-left">{j.faults}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Attachments</h2>
        {pledge.media?.length === 0 ? (
          <p className="text-gray-500 italic">No files attached.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pledge.media?.map((m: any) => (
              <div key={m.id} className="border rounded-lg p-2 hover:shadow-md transition-shadow bg-white">
                <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                  {m.type === "image" ? (
                    <img src={m.url} alt="attachment" className="object-cover w-full h-full cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(m.url, '_blank')} />
                  ) : m.type === "audio" ? (
                    <div className="text-center p-2">
                      <span className="text-4xl">🎵</span>
                      <audio controls src={m.url} className="w-full mt-2 h-8" />
                    </div>
                  ) : (
                    <a href={m.url} target="_blank" rel="noreferrer" className="flex flex-col items-center text-blue-600 hover:text-blue-800">
                      <span className="text-4xl mb-1">📄</span>
                      <span className="text-xs uppercase font-bold">Download</span>
                    </a>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate px-1" title={m.original_name || 'File'}>
                  {m.original_name || `File #${m.id}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PledgeView;
