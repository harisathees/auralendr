import React from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import PledgeForm from "../../components/Pledges/PledgeForm";
import { useAuth } from "../../context/AuthContext";

const Create: React.FC = () => {
  const navigate = useNavigate();
  const { can, user } = useAuth();

  const handleSubmit = async (fd: FormData) => {
    try {
      await http.post("/pledges", fd);
      navigate("/pledges");
    } catch (err) {
      console.error("Failed to create pledge", err);
      // Toast handling would go here
    }
  };

  const [metalRates, setMetalRates] = React.useState<{ gold: string; silver: string }>({ gold: "", silver: "" });

  React.useEffect(() => {
    // Fetch metal rates
    http.get("/metal-rates").then(res => {
      const rates = res.data;
      const gold = rates.find((r: any) => r.name === 'Gold')?.metal_rate?.rate || "";
      const silver = rates.find((r: any) => r.name === 'Silver')?.metal_rate?.rate || "";
      setMetalRates({ gold, silver });
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">

      {/* Header */}
      <header className="flex-none flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 shadow-sm border-b border-border-green/50 z-10 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-primary-text dark:text-white">arrow_back</span>
        </button>

        <div className="flex-1 flex justify-center">
          <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center whitespace-nowrap">Create Pledge</h2>
        </div>

        {(metalRates.gold || metalRates.silver) ? (
          <div className="flex items-center gap-3 text-xs md:text-sm font-medium bg-gradient-to-r from-amber-50/50 to-slate-50/50 dark:from-amber-900/10 dark:to-slate-900/10 px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/30 shadow-sm transition-all hover:shadow-md cursor-default group shrink-0">
            {metalRates.gold && (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="hidden sm:inline">Gold:</span>
                <span className="sm:hidden">G:</span>
                ₹{metalRates.gold}
              </span>
            )}
            {metalRates.silver && (
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 border-l border-gray-200 dark:border-gray-700/50 pl-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75 duration-1000 delay-300"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
                </span>
                <span className="hidden sm:inline">Silver:</span>
                <span className="sm:hidden">S:</span>
                ₹{metalRates.silver}
              </span>
            )}
          </div>
        ) : (
          <div className="w-10 shrink-0"></div>
        )}

        <div className="w-10 shrink-0"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {!can('pledge.create') ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">lock</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Access Denied</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You don't have permission to create pledges.</p>
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
              <p><strong>Debug Info:</strong></p>
              <p>Role: {user?.role}</p>
              <p>Check: pledge.create</p>
              <p>Has Permission: NO</p>
            </div>
          </div>
        ) : (
          <>
            <PledgeForm onSubmit={handleSubmit} />
            <div className="fixed bottom-0 right-0 p-2 bg-black/50 text-white text-[10px] pointer-events-none z-50">
              Debug: Role: {user?.role} | Perms: {user?.permissions?.includes('pledge.create') ? 'Yes' : 'No'} | Allow: Yes
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default Create;
