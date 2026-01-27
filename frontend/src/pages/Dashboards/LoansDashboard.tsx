import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { toast } from "react-hot-toast";
import ReportCard from "../../components/Dashboard/ReportCard";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Wallet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface LoanStatItem {
  count: number;
  principal: number;
  interest: number;
}

interface DashboardStats {
  loan_stats: {
    total: LoanStatItem;
    active: LoanStatItem;
    closed: LoanStatItem;
    overdue: LoanStatItem;
  };
  trends: {
    month: string;
    total_amount: number;
    count: number;
  }[];
  branch_distribution: {
    branch_name: string;
    count: number;
    total_amount: number;
  }[];
  status_distribution: {
    status: string;
    count: number;
  }[];
}

const COLORS = ['#00E676', '#FFAB00', '#FF5252', '#2979FF', '#AA00FF'];

interface Props {
  filters?: { branch_id?: number; start_date?: string; end_date?: string };
}

const DetailedStatsCard = ({ title, data, icon, color }: { title: string, data?: LoanStatItem, icon: React.ReactNode, color: string }) => {

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.count || 0} <span className="text-sm font-normal text-gray-500">Loans</span></h3>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Principal</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(data?.principal || 0)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Interest</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(data?.interest || 0)}</span>
        </div>
      </div>
    </div>
  );
}

const LoansDashboard: React.FC<Props> = ({ filters = {} }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/stats", { params: filters });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(amount));
  };

  // Calculate growth percentage from trends
  const calculateGrowth = (key: 'total_amount' | 'count') => {
    if (!stats?.trends || stats.trends.length < 2) return null;
    const current = stats.trends[stats.trends.length - 1][key];
    const previous = stats.trends[stats.trends.length - 2][key];
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Detailed Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DetailedStatsCard
          title="Total Loans"
          data={stats?.loan_stats?.total}
          icon={<Wallet className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <DetailedStatsCard
          title="Active Loans"
          data={stats?.loan_stats?.active}
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <DetailedStatsCard
          title="Closed Loans"
          data={stats?.loan_stats?.closed}
          icon={<XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
          color="bg-gray-100 dark:bg-gray-800"
        />
        <DetailedStatsCard
          title="Overdue Loans"
          data={stats?.loan_stats?.overdue}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          color="bg-red-50 dark:bg-red-900/20"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Report Card */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-96 bg-white dark:bg-[#1A1D1F] rounded-3xl animate-pulse"></div>
          ) : (
            <ReportCard
              title="Lending Report"
              chartData={stats?.trends || []}
              chartColor="#AA00FF"
              summaryStats={[
                {
                  label: 'Monthly',
                  value: stats?.loan_stats?.total ? formatCurrency(stats.loan_stats.total.principal / 12) : '...',
                  growth: calculateGrowth('total_amount') || '0%',
                  icon: 'star',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600'
                },
                {
                  label: 'Yearly',
                  value: stats?.loan_stats?.total ? formatCurrency(stats.loan_stats.total.principal) : '...',
                  growth: calculateGrowth('total_amount') || '0%',
                  icon: 'military_tech',
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600'
                }
              ]}
              listItems={stats?.branch_distribution?.map(b => ({
                label: b.branch_name,
                value: formatCurrency(b.total_amount)
              })) || []}
            />
          )}
        </div>

        {/* Secondary Info / Status Distribution */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Status Distribution</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={stats?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {stats?.status_distribution?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {stats?.status_distribution?.map((entry, index) => (
                <div key={entry.status} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">{entry.status}</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white ml-auto">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansDashboard;
