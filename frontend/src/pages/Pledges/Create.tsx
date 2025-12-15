import React from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import PledgeForm from "../../components/Pledges/PledgeForm";

const Create: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (fd: FormData) => {
    try {
      await http.post("/pledges", fd);
      navigate("/pledges");
    } catch (err) {
      console.error("Failed to create pledge", err);
      // Toast handling would go here
    }
  };

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

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <PledgeForm onSubmit={handleSubmit} />
      </main>

    </div>
  );
};

export default Create;
