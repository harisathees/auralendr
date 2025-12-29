<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Pledge;
use App\Models\Pledge\Loan;
use App\Models\Transaction\Transaction;
use App\Models\Admin\Organization\Branch\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $branchId = $request->query('branch_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $pledgeQuery = Pledge::query();
        $loanQuery = Loan::query()->whereHas('pledge', function ($q) use ($branchId) {
            if ($branchId) {
                $q->where('branch_id', $branchId);
            }
        });

        if ($branchId) {
            $pledgeQuery->where('branch_id', $branchId);
        }

        if ($startDate && $endDate) {
            $pledgeQuery->whereBetween('created_at', [$startDate, $endDate]);
            $loanQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Summary Stats
        $totalPledges = (clone $pledgeQuery)->count();
        $activePledges = (clone $pledgeQuery)->where('status', 'active')->count();
        $closedPledges = (clone $pledgeQuery)->where('status', 'closed')->count();

        $totalLoanAmount = (clone $loanQuery)->sum('amount');
        $interestCollected = Transaction::where('transactionable_type', 'App\Models\Pledge\PledgeClosure')
            ->when($branchId, function ($q) use ($branchId) {
                $q->whereHasMorph('transactionable', ['App\Models\Pledge\PledgeClosure'], function ($query) use ($branchId) {
                    $query->whereHas('pledge', function ($sq) use ($branchId) {
                        $sq->where('branch_id', $branchId);
                    });
                });
            })
            ->sum('amount'); // This might need refinement based on how interest is tracked

        // Monthly Trends (Last 6 Months)
        $trends = Loan::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
            ->whereHas('pledge', function ($q) use ($branchId) {
                if ($branchId) {
                    $q->where('branch_id', $branchId);
                }
            })
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Branch-wise distribution
        $branchDistribution = Branch::withCount([
            'users as pledge_count' => function ($q) use ($startDate, $endDate) {
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            }
        ])
            ->get()
            ->map(function ($branch) use ($startDate, $endDate, $branchId) {
                if ($branchId && $branch->id != $branchId)
                    return null;

                $loans = Loan::whereHas('pledge', function ($q) use ($branch) {
                    $q->where('branch_id', $branch->id);
                });

                if ($startDate && $endDate) {
                    $loans->whereBetween('created_at', [$startDate, $endDate]);
                }

                return [
                    'branch_name' => $branch->branch_name,
                    'count' => Pledge::where('branch_id', $branch->id)->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    })->count(),
                    'total_amount' => $loans->sum('amount')
                ];
            })->filter()->values();

        // Status Distribution
        $statusDistribution = (clone $pledgeQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'summary' => [
                'total_pledges' => $totalPledges,
                'active_pledges' => $activePledges,
                'closed_pledges' => $closedPledges,
                'total_loan_amount' => $totalLoanAmount,
                'interest_collected' => $interestCollected,
            ],
            'trends' => $trends,
            'branch_distribution' => $branchDistribution,
            'status_distribution' => $statusDistribution,
        ]);
    }
}
