import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Wallet, CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import OverviewCarousel from "../../components/Dashboard/OverviewCarousel";

interface LoanStatItem {
  count: number;
  principal: number;
  interest: number;
}

interface RepledgeStatItem {
  count: number;
  amount: number;
  interest: number;
}

interface DashboardStats {
  loan_stats: {
    total: LoanStatItem;
    active: LoanStatItem;
    closed: LoanStatItem;
    overdue: LoanStatItem;
  };
  repledge_stats: {
    total: RepledgeStatItem;
    active: RepledgeStatItem;
    released: RepledgeStatItem;
    overdue: RepledgeStatItem;
  };
  business_stats: {
    turnover: number;
    net_profit: number;
    collected_interest?: number;
    customers: number;
    assets_value: {
      total_value: number;
    };
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

interface Props {
  filters?: { branch_id?: string | number; start_date?: string; end_date?: string };
}

const DetailedStatsCard = ({ title, count, amount, icon, color, linkTo }: { title: string, count: number, amount?: number, icon: React.ReactNode, color: string, linkTo?: string }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CardContent = () => (
    <div className={`bg-white dark:bg-[#1A1D1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between ${linkTo ? 'cursor-pointer' : ''}`}>
      <div>
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 whitespace-nowrap">{title}</p>
        {amount !== undefined && (
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 mt-1">
            {formatCurrency(amount)}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full relative flex items-center justify-center shrink-0 ${color}`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          {icon}
        </div>
        <h3 className="relative text-base font-bold text-gray-900 dark:text-white z-10">{count}</h3>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
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

  const getLink = (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (filters?.branch_id) params.set('branch_id', String(filters.branch_id));
    if (status !== 'overdue') { // Overdue should not be filtered by creation date range
      if (filters?.start_date) params.set('start_date', filters.start_date);
      if (filters?.end_date) params.set('end_date', filters.end_date);
    }
    return `/reports/verification?${params.toString()}`;
  };

  const getRepledgeLink = (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (filters?.branch_id) params.set('branch_id', String(filters.branch_id));

    // For Overdue, we generally ignore date range filters to show ALL overdue items currently
    if (status !== 'overdue') {
      if (filters?.start_date) params.set('start_date', filters.start_date);
      if (filters?.end_date) params.set('end_date', filters.end_date);
    }

    return `/reports/verification/repledge-interest?${params.toString()}`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Overview Carousel */}
      <OverviewCarousel
        loading={loading}
        stats={{
          assets_value: stats?.business_stats?.assets_value?.total_value || 0,
          customers: stats?.business_stats?.customers || 0,
          net_profit: stats?.business_stats?.net_profit || 0,
          gross_profit: (stats?.business_stats as any)?.collected_interest || 0,
          total_portfolio: (stats?.loan_stats?.active?.principal || 0) + (stats?.loan_stats?.overdue?.principal || 0)
        }}
      />

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        {/* Left Column: Customer Pledges */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Customer Pledges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailedStatsCard
              title="Total Pledges"
              count={stats?.loan_stats?.total?.count || 0}
              amount={stats?.loan_stats?.total?.principal || 0}
              icon={<Wallet className="w-6 h-6 text-blue-600" />}
              color="bg-blue-50 dark:bg-blue-900/20"
              linkTo={getLink()}
            />
            <DetailedStatsCard
              title="Active Pledges"
              count={stats?.loan_stats?.active?.count || 0}
              amount={stats?.loan_stats?.active?.principal || 0}
              icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
              color="bg-green-50 dark:bg-green-900/20"
              linkTo={getLink('active')}
            />
            <DetailedStatsCard
              title="Closed Pledges"
              count={stats?.loan_stats?.closed?.count || 0}
              amount={stats?.loan_stats?.closed?.principal || 0}
              icon={<XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
              color="bg-gray-100 dark:bg-gray-800"
              linkTo={getLink('closed')}
            />
            <DetailedStatsCard
              title="Overdue Pledges"
              count={stats?.loan_stats?.overdue?.count || 0}
              amount={stats?.loan_stats?.overdue?.principal || 0}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              color="bg-red-50 dark:bg-red-900/20"
              linkTo={getLink('overdue')}
            />
            <DetailedStatsCard
              title="Active Interest"
              count={stats?.loan_stats?.active?.count || 0}
              amount={stats?.loan_stats?.active?.interest || 0}
              icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
              color="bg-orange-50 dark:bg-orange-900/20"
              linkTo={`/reports/verification/interest?${new URLSearchParams({
                ...(filters?.branch_id ? { branch_id: String(filters.branch_id) } : {}),
                ...(filters?.start_date ? { start_date: filters.start_date } : {}),
                ...(filters?.end_date ? { end_date: filters.end_date } : {}),
              }).toString()}`}
            />
            <DetailedStatsCard
              title="Closed Interest"
              count={stats?.loan_stats?.closed?.count || 0}
              amount={stats?.loan_stats?.closed?.interest || 0}
              icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
              color="bg-green-50 dark:bg-green-900/20"
              linkTo={`/reports/verification/interest?status=closed&${new URLSearchParams({
                ...(filters?.branch_id ? { branch_id: String(filters.branch_id) } : {}),
                ...(filters?.start_date ? { start_date: filters.start_date } : {}),
                ...(filters?.end_date ? { end_date: filters.end_date } : {}),
              }).toString()}`}
            />
            <DetailedStatsCard
              title="Overdue Interest"
              count={stats?.loan_stats?.overdue?.count || 0}
              amount={stats?.loan_stats?.overdue?.interest || 0}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              color="bg-red-50 dark:bg-red-900/20"
              linkTo={`/reports/verification/interest?status=overdue&${new URLSearchParams({
                ...(filters?.branch_id ? { branch_id: String(filters.branch_id) } : {}),
                // Explicitly excluding date filters
              }).toString()}`}
            />
          </div>
        </div>

        {/* Right Column: Bank Pledges (Repledges) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-bold">B</div>
            Bank Pledges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailedStatsCard
              title="Total Repledges"
              count={stats?.repledge_stats?.total?.count || 0}
              amount={stats?.repledge_stats?.total?.amount || 0}
              icon={<Wallet className="w-6 h-6 text-purple-600" />}
              color="bg-purple-50 dark:bg-purple-900/20"
              linkTo={getRepledgeLink()}
            />
            <DetailedStatsCard
              title="Active Repledges"
              count={stats?.repledge_stats?.active?.count || 0}
              amount={stats?.repledge_stats?.active?.amount || 0}
              icon={<CheckCircle2 className="w-6 h-6 text-teal-600" />}
              color="bg-teal-50 dark:bg-teal-900/20"
              linkTo={getRepledgeLink('active')}
            />
            <DetailedStatsCard
              title="Released Repledges"
              count={stats?.repledge_stats?.released?.count || 0}
              amount={stats?.repledge_stats?.released?.amount || 0}
              icon={<XCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
              color="bg-slate-100 dark:bg-slate-800"
              linkTo={getRepledgeLink('closed')}
            />
            <DetailedStatsCard
              title="Overdue Repledges"
              count={stats?.repledge_stats?.overdue?.count || 0}
              amount={stats?.repledge_stats?.overdue?.amount || 0}
              icon={<AlertCircle className="w-6 h-6 text-rose-600" />}
              color="bg-rose-50 dark:bg-rose-900/20"
              linkTo={getRepledgeLink('overdue')}
            />
            <DetailedStatsCard
              title="Active Interest"
              count={stats?.repledge_stats?.active?.count || 0}
              amount={stats?.repledge_stats?.active?.interest || 0}
              icon={<TrendingUp className="w-6 h-6 text-violet-600" />}
              color="bg-violet-50 dark:bg-violet-900/20"
              linkTo={getRepledgeLink('active')}
            />
            <DetailedStatsCard
              title="Closed Interest"
              count={stats?.repledge_stats?.released?.count || 0} // Using Released count
              amount={stats?.repledge_stats?.released?.interest || 0}
              icon={<CheckCircle2 className="w-6 h-6 text-teal-600" />}
              color="bg-teal-50 dark:bg-teal-900/20"
              linkTo={getRepledgeLink('closed')}
            />
            <DetailedStatsCard
              title="Overdue Interest"
              count={stats?.repledge_stats?.overdue?.count || 0}
              amount={stats?.repledge_stats?.overdue?.interest || 0}
              icon={<AlertCircle className="w-6 h-6 text-rose-600" />}
              color="bg-rose-50 dark:bg-rose-900/20"
              linkTo={getRepledgeLink('overdue')}
            />
          </div>
        </div>
      </div>


    </div >
  );
};

export default LoansDashboard;
