import React from "react";
import { Link } from "react-router-dom";

interface Props {
  pledges: any[];
}

const PledgeList: React.FC<Props> = ({ pledges }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pledges</h2>
        <Link
          to="/pledges/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow"
        >
          + New Pledge
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Loan Amount
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pledges.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 border-b border-gray-200">
                <td className="px-5 py-5 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">#{p.id}</p>
                </td>
                <td className="px-5 py-5 text-sm">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-medium">
                        {p.customer?.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {p.customer?.mobile_no}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    ₹{p.loan?.amount}
                  </p>
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${p.status === 'closed' ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}>
                    <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                    <span className="relative capitalize">{p.status || 'Active'}</span>
                  </span>
                </td>
                <td className="px-5 py-5 text-sm text-right">
                  <div className="flex justify-end space-x-3">
                    <Link
                      to={`/pledges/${p.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      to={`/pledges/${p.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {pledges.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-5 text-center text-gray-500">
                  No pledges found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PledgeList;
