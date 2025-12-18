import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../../api/http";
import PledgeForm from "../../components/Pledges/PledgeForm";
import { useAuth } from "../../context/AuthContext";

const Edit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    http.get(`/pledges/${id}`).then(res => setData(res.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (fd: FormData) => {
    try {
      await http.post(`/pledges/${id}?_method=PUT`, fd);
      navigate("/pledges");
    } catch (err) {
      console.error("Failed to update pledge", err);
    }
  };

  if (!data) return <div className="flex items-center justify-center h-full">Loading...</div>;

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
        <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Edit Pledge</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {!can('pledge.update') ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You don't have permission to edit pledges.</p>
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
              <p><strong>Debug Info:</strong></p>
              <p>Check: pledge.update</p>
              <p>Has Permission: {can('pledge.update') ? 'YES' : 'NO'}</p>
            </div>
          </div>
        ) : (
          <PledgeForm initial={data} onSubmit={handleSubmit} />
        )}
      </main>

    </div>
  );
};

export default Edit;
