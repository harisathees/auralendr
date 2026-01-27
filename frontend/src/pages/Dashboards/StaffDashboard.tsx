import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/Auth/AuthContext";
import api from '../../api/apiClient';
import type { Task } from '../../types/models';
import TaskAccordion from '../../components/Staff/TaskAccordion';
import {
  LogOut,
  Zap,
  Store,
  Loader2,
  ClipboardList,
  CalendarX,
  Calculator,
  Scale,
  History,
  CheckCircle
} from "lucide-react";

import GoldLoanCalculator from '../../components/Calculators/GoldLoanCalculator';
import ClosingAmountCalculator from '../../components/Calculators/ClosingAmountCalculator';
import { ActivityService } from '../../services/ActivityService';
import type { Activity } from '../../types/Activity';

import StaffTopNavigation from '../../components/Shared/Navigation/StaffNavigation/StaffTopNavigation';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  // const [showMenu, setShowMenu] = useState(false); // Moved to StaffTopNavigation
  const [showConfirm, setShowConfirm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Modal States
  const [showCalculator, setShowCalculator] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!user?.id) return;
    try {
      const response = await ActivityService.getActivities({ user_id: user.id.toString(), page: 1 });
      setActivities(response.data.slice(0, 10)); // Top 10 recent
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user?.id) {
      fetchActivities();
    }
  }, [user?.id]);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  // Filter tasks based on selectedDate
  const filteredTasks = selectedDate
    ? tasks.filter(task => {
      if (!task.due_date) return false;
      // Compare just the date part (YYYY-MM-DD)
      return task.due_date.startsWith(selectedDate);
    })
    : tasks;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const handleDateIconClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
    if (dateInputRef.current) dateInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark group/design-root font-display scrollbar-hide">

      {/* Header - Fixed */}
      <StaffTopNavigation
        onLogout={handleLogoutClick}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        dateInputRef={dateInputRef}
        onDateIconClick={handleDateIconClick}
      />

      {/* Spacer for Fixed Header */}
      <div className="h-[88px] w-full flex-none" />

      {/* Mobile Rates (Visible only on small screens) */}


      <main className="flex-1 px-4 pb-4 space-y-6">

        {/* 1. Progress Card (with Cash Balance) */}
        <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] dark:from-gray-800 dark:to-gray-900 p-5 relative overflow-hidden">


          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#166534] dark:text-primary" />
                <p className="text-[#166534] dark:text-gray-200 text-base font-bold leading-normal">Daily Progress</p>
              </div>
              {user?.branch && (
                <div className="flex items-center gap-1.5 ml-0.5">
                  <Store className="w-4 h-4 text-[#166534]/70 dark:text-gray-400" />
                  <p className="text-[#166534]/80 dark:text-gray-400 text-sm font-medium">
                    {user.branch.branch_name}
                  </p>
                  {/* Cash Balance Display inside Progress Card */}
                  {/* <div className="ml-2 pl-3 border-l border-[#166534]/20 dark:border-gray-600 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#166534]/80 dark:text-gray-400" />
                    <span className="text-[#166534] dark:text-white font-bold text-sm">₹ 2,45,000</span>
                  </div> */}
                </div>
              )}
            </div>
            <div className="relative flex items-center justify-center size-20">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-green-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-primary transition-all duration-1000 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${progressPercentage}, 100`} strokeLinecap="round" strokeWidth="3" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-primary text-xl font-bold">{completedTasks}/{totalTasks}</span>
                <span className="text-secondary-text dark:text-gray-400 text-xs">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quick Actions (Single Row of Icons) */}
        <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar">
          {[
            { icon: Calculator, label: "Calculator", color: "purple", action: () => setShowCalculator(true) },
            { icon: Scale, label: "Estimate", color: "orange", action: () => setShowEstimate(true) },
            // { icon: Wallet, label: "Payments", color: "blue", action: () => { } }, // Placeholder
            // { icon: Megaphone, label: "Notices", color: "pink", action: () => { } }, // Placeholder
            // { icon: History, label: "Activity", color: "slate", action: () => { } }, // Placeholder
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className="flex flex-col items-center gap-2 group min-w-[70px]"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 transition-all group-hover:scale-110 group-active:scale-95 bg-white dark:bg-gray-800`}>
                <action.icon className={`w-6 h-6 text-${action.color}-500`} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* 3. Task List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary-text dark:text-white">
              {selectedDate ? `Tasks for ${new Date(selectedDate).toLocaleDateString()}` : "Assigned Tasks"}
            </h3>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}

            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-gray-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            selectedDate ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-60 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <CalendarX className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No tasks found</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-60 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <ClipboardList className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">All caught up!</p>
              </div>
            )
          ) : (
            filteredTasks.map((task) => (
              <TaskAccordion
                key={task.id}
                task={task}
                onUpdate={fetchTasks}
              />
            ))
          )}
        </div>

        {/* Recent Activity (Expanded Row) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" /> Recent Activity
            </h3>
            <button
              onClick={() => window.location.href = '/activities'}
              className="text-xs font-medium text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.action === 'create' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    activity.action === 'update' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      activity.action === 'delete' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                    {activity.action === 'create' ? <CheckCircle className="w-5 h-5" /> :
                      activity.action === 'update' ? <ClipboardList className="w-5 h-5" /> :
                        activity.action === 'delete' ? <LogOut className="w-5 h-5" /> :
                          <History className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {activity.description}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{activity.action}</span>
                      <span>•</span>
                      <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Modals */}
      <GoldLoanCalculator isOpen={showEstimate} onClose={() => setShowEstimate(false)} />
      <ClosingAmountCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />


      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-8 h-8" />
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



export default StaffDashboard;
