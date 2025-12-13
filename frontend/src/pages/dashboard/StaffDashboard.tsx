import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  // Sample customer data matching the HTML
  const customers = [
    {
      id: 1,
      name: "Vasanth",
      amount: "25,000",
      loanId: "HS-2510",
      location: "217,Threspuram",
    },
    {
      id: 2,
      name: "Hari",
      amount: "5,000",
      loanId: "HS-0912",
      location: "Teacher's colony",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark group/design-root font-display scrollbar-hide">

      {/* Header */}
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pt-6 pb-4 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:opacity-80 transition-opacity"
              data-alt="User profile picture"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGCEYIREr57IBTkJsHm59gh0WKp9dbBSEG8N8UVpQzTiGEWt77RRPUn6jOSt5F-RDZ6FWVLfFbh3E8hZ5KHiTRzsZ444Q0LWPxxlH_mO1DbHOsA88OixugIxk1Ko_GD9Yaz-xQPVN2x0QfhnVtu2bycqEH2d6tihg0yGj58VjTOVUgmFJ-5HVEVQSYCtPMfCAV9NV5nn_7Of8JYgkY9TQVKYIayhvSBOMD5Q7kyhtyD2MfXTqsj03ww0lMI6dvxSHDnJa7PrE6a0cf")',
              }}
            />
          </div>

          {/* Avatar Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute top-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 border border-gray-200 dark:border-gray-600"
                    style={{
                      backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGCEYIREr57IBTkJsHm59gh0WKp9dbBSEG8N8UVpQzTiGEWt77RRPUn6jOSt5F-RDZ6FWVLfFbh3E8hZ5KHiTRzsZ444Q0LWPxxlH_mO1DbHOsA88OixugIxk1Ko_GD9Yaz-xQPVN2x0QfhnVtu2bycqEH2d6tihg0yGj58VjTOVUgmFJ-5HVEVQSYCtPMfCAV9NV5nn_7Of8JYgkY9TQVKYIayhvSBOMD5Q7kyhtyD2MfXTqsj03ww0lMI6dvxSHDnJa7PrE6a0cf")',
                    }}
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || "Nambirajan"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Staff Member</p>
                  </div>
                </div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                  onClick={handleLogoutClick}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            </>
          )}

          <div className="flex flex-col">
            <p className="text-secondary-text dark:text-gray-400 text-sm font-medium leading-tight">Good morning!</p>
            <h2 className="text-primary-text dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">
              {user?.name || "Nambirajan"}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {/* Theme Toggle - Logic moved to ThemeContext, but button remains here */}
          <ThemeToggle />

          <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-primary-text dark:text-gray-100">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
          <button className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-primary-text dark:text-gray-100">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 flex size-2.5 rounded-full bg-primary ring-2 ring-background-light dark:ring-background-dark" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-4">
        {/* Task Progress Card */}
        <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] dark:from-gray-800 dark:to-gray-900 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534] dark:text-primary">bolt</span>
              <p className="text-[#166534] dark:text-gray-200 text-base font-bold leading-normal">Daily Task Progress</p>
            </div>
            <div className="relative flex items-center justify-center size-20">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-green-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="60, 100" strokeLinecap="round" strokeWidth="3" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-primary text-xl font-bold">6/10</span>
                <span className="text-secondary-text dark:text-gray-400 text-xs">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="flex flex-col gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex flex-col items-stretch justify-start rounded-xl bg-card-light dark:bg-card-dark shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none p-4 gap-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-primary-text dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">
                  {customer.name}
                </p>
                <p className="text-primary text-xl font-bold leading-tight">₹{customer.amount}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-text dark:text-gray-400 text-base">description</span>
                  <p className="text-secondary-text dark:text-gray-400 text-sm font-medium">Loan ID: {customer.loanId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-text dark:text-gray-400 text-base">location_on</span>
                  <p className="text-secondary-text dark:text-gray-400 text-sm font-medium">Location: {customer.location}</p>
                </div>
              </div>
              <div className="flex flex-1 gap-3 justify-end">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-primary text-sm font-bold leading-normal tracking-[0.015em] border-2 border-primary">
                  <span className="truncate">Call</span>
                </button>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white dark:text-black text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Log Out?</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation - Moved to Layout */}
    </div>
  );
};

// Extracted Theme Toggle for cleaner code (internal component)
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-primary-text dark:text-gray-100"
    >
      <span className="material-symbols-outlined">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  )
}

// Need to import useTheme for the toggle
import { useTheme } from "../../context/ThemeContext";

export default StaffDashboard;

