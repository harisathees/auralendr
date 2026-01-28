<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Pledge;
use App\Models\Pledge\Loan;
use App\Models\Repledge\Repledge;
use App\Models\Transaction\Transaction;
use App\Models\Admin\Organization\Branch\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $branchId = $request->query('branch_id');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            if ($startDate) {
                $startDate = Carbon::parse($startDate)->startOfDay();
            }
            if ($endDate) {
                $endDate = Carbon::parse($endDate)->endOfDay();
            }

            // --- Helper Functions ---

            // Helper to calculate Accrued Interest (Jumping Month Logic)
            $calculateAccruedInterest = function ($loans) {
                $totalAccrued = 0;
                $now = Carbon::now();

                foreach ($loans as $loan) {
                    // Start date for interest: Last Payment Date OR Loan Date
                    // We need to fetch payments. Assumes $loan currently has 'payments' loaded or lazy loads.
                    // For performance, eager load 'payments'.

                    $lastPayment = $loan->payments->sortByDesc('payment_date')->first();
                    $fromDate = $lastPayment ? Carbon::parse($lastPayment->payment_date) : Carbon::parse($loan->date);

                    if ($now->lessThan($fromDate)) {
                        continue;
                    }

                    // Jumping Month Logic: Any part of a month counts as a month?
                    // Or precise months?
                    // User requested "Acturate". Standard Gold Loan = Jumping Month.
                    // (Difference in months) + (if day > day ? 1 : 0)

                    $diffYears = $now->year - $fromDate->year;
                    $diffMonths = $now->month - $fromDate->month;
                    $months = $diffYears * 12 + $diffMonths;

                    if ($now->day > $fromDate->day) {
                        $months++;
                    }

                    // Specific Logic: Minimum 1 month? Or 0 if same day?
                    // Usually min 1 month if < 30 days is debatable. 
                    // Let's stick to standard diff. If 0 months passed (e.g. yesterday), and logic gives 0, then 0.
                    // But usually Gold Loan is "Min 15 days" or "Min 1 month".
                    // I will stick to pure calculated months for now.

                    if ($months < 0)
                        $months = 0;

                    $rate = $loan->interest_percentage;
                    $balance = $loan->balance_amount ?? $loan->amount; // Fallback to amount if balance null

                    $interest = $balance * ($rate / 100) * $months;
                    $totalAccrued += $interest;
                }
                return $totalAccrued;
            };


            // --- DATA FETCHING ---

            // 1. REALIZED REVENUE (Paid Interest)
            // A. From Closures (Final Settlements)
            $realizedClosureInterest = \App\Models\Pledge\PledgeClosure::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $q->whereBetween('closed_date', [$startDate, $endDate]);
            })->sum(DB::raw('calculated_interest - interest_reduction'));

            // B. From Partial Payments
            $interestFromPartial = \App\Models\Pledge\LoanPayment::whereHas('loan.pledge', function ($q) use ($branchId) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
            })
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('payment_date', [$startDate, $endDate]);
                })->sum('interest_amount');

            $totalPaidInterest = $realizedClosureInterest + $interestFromPartial;


            // 2. ACTIVE LOANS STATS
            $activeLoansQuery = Loan::with(['payments']) // Eager load payments
                ->whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                    $q->where('status', 'active');
                    if ($branchId)
                        $q->where('branch_id', $branchId);
                    if ($startDate && $endDate)
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                });

            // Get all active loans for calculation (might be heavy, consider chunking if needed)
            // For now, assuming manageable volume.
            $activeLoansCollection = $activeLoansQuery->get();

            $activeCount = $activeLoansCollection->count(); // Pledge count or Loan count? Dashboard says "Loans". 1 Pledge = 1 Loan usually, but Schema is 1 Pledge -> Many Loans?
            // Existing logic used Pledge::count(). 
            // $activeLoansQuery is on LOANS table.

            // Let's align with existing dashboard logic:
            // "Loans Dashboard" statistics usually count "Pledges" or "Loans".
            // Previous code: $activeCount = Pledge::where...count().
            // If 1 Pledge has multiple Loans (multipart), do we sum them?
            // Usually 1 Pledge = 1 Loan Transaction in UI.
            // Let's stick to Pledge Count for "Count", but Loan Sum for Amounts.

            $activePledgeCount = Pledge::where('status', 'active')->where(function ($q) use ($branchId, $startDate, $endDate) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            $activePrincipal = $activeLoansCollection->sum('balance_amount');
            $activeAccruedInterest = $calculateAccruedInterest($activeLoansCollection);


            // 3. OVERDUE LOANS STATS
            // Logic: Active/Overdue status AND due_date < now
            $overdueLoansQuery = Loan::with(['payments'])
                ->whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                    $q->where(function ($sub) {
                        $sub->where('status', 'active')->orWhere('status', 'overdue');
                    });
                    if ($branchId)
                        $q->where('branch_id', $branchId);
                    if ($startDate && $endDate)
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                })
                ->where('due_date', '<', Carbon::now());

            $overdueLoansCollection = $overdueLoansQuery->get();

            $overdueCount = $overdueLoansCollection->count(); // Here counting Loans might be more accurate for "Overdue Items"
            // But consistency? user sees "Overdue Loans: 5".
            // Let's assume Loan-level grouping for Overdue logic.

            $overduePrincipal = $overdueLoansCollection->sum('balance_amount');
            $overdueAccruedInterest = $calculateAccruedInterest($overdueLoansCollection);


            // 4. CLOSED LOANS STATS
            $closedPledgeCount = Pledge::where('status', 'closed')->where(function ($q) use ($branchId, $startDate, $endDate) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            $closedPrincipal = Loan::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                $q->where('status', 'closed');
                if ($branchId)
                    $q->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $q->whereBetween('created_at', [$startDate, $endDate]);
            })->sum('amount'); // Original principal volume

            $closedInterest = $realizedClosureInterest; // Only what was paid on closure. (Plus partials for closed loans?)
            // Note: $interestFromPartial sums partials for ALL loans (active + closed) in the period?
            // Dashboard requirement: "Closed Loans Interest".
            // Should strictly be interest EARNED from loans that are NOW closed.
            // Previous logic: $realizedClosureInterest. 
            // If I stick to that, it's consistent.


            // 5. TOTAL STATS
            $totalCount = $activePledgeCount + $closedPledgeCount; // Or Pledge::count()
            $totalPrincipal = $activePrincipal + $closedPrincipal; // Or Loan::sum('amount')??
            // "Loans Dashboard" -> Total usually implies "Total Disbursed" or "Total Portfolio Size"?
            // User: "Total Loans ... Principal ... Interest".
            // If they mean "Current Portfolio": Active + Overdue.
            // If they mean "Historical Volume": Active + Closed.
            // Given "Closed Loans" is a card, it's likely Historical Volume.
            // Principal: Total Disbursed Correct ($activePrincipal + $closedPrincipal?? No, Active is Balance).
            // Total Principal Disbursed = Loan::sum('amount').

            $totalDisbursed = Loan::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $q->whereBetween('created_at', [$startDate, $endDate]);
            })->sum('amount');

            $totalInterest = $totalPaidInterest + $activeAccruedInterest;
            // Total Interest Revenue + Potential Revenue? 
            // "Interest" on Total Card: Usually "Earnings".
            // Let's show Total Earnings ($totalPaidInterest) + Accrued? 
            // Or just Earnings.
            // Let's go with Earnings + Accrued to show "Total Value".


            // --- CHARTS & TRENDS (Preserved) ---
            $trends = Loan::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as count')
            )
                ->whereHas('pledge', function ($q) use ($branchId) {
                    if ($branchId)
                        $q->where('branch_id', $branchId);
                })
                ->where('created_at', '>=', Carbon::now()->subMonths(6))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $branchDistribution = Branch::withCount([
                'users as pledge_count' => function ($q) use ($startDate, $endDate) {
                    if ($startDate && $endDate)
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            ])
                ->get()
                ->map(function ($branch) use ($startDate, $endDate, $branchId) {
                    if ($branchId && $branch->id != $branchId)
                        return null;
                    $loans = Loan::whereHas('pledge', function ($q) use ($branch) {
                        $q->where('branch_id', $branch->id);
                    });
                    if ($startDate && $endDate)
                        $loans->whereBetween('created_at', [$startDate, $endDate]);

                    return [
                        'branch_name' => $branch->branch_name,
                        'count' => Pledge::where('branch_id', $branch->id)->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                            $q->whereBetween('created_at', [$startDate, $endDate]);
                        })->count(),
                        'total_amount' => $loans->sum('amount')
                    ];
                })->filter()->values();

            $pledgeQuery = Pledge::query();
            if ($branchId)
                $pledgeQuery->where('branch_id', $branchId);
            if ($startDate && $endDate)
                $pledgeQuery->whereBetween('created_at', [$startDate, $endDate]);
            $statusDistribution = $pledgeQuery->select('status', DB::raw('count(*) as count'))->groupBy('status')->get();


            // --- Repledge Stats (Preserved) ---
            $repledgeQuery = Repledge::query();
            if ($branchId)
                $repledgeQuery->where('branch_id', $branchId);
            if ($startDate && $endDate)
                $repledgeQuery->whereBetween('created_at', [$startDate, $endDate]);

            $totalRepCount = (clone $repledgeQuery)->count();
            $totalRepAmount = (clone $repledgeQuery)->sum('amount');
            $activeRepCount = (clone $repledgeQuery)->where('status', 'open')->count();
            $activeRepAmount = (clone $repledgeQuery)->where('status', 'open')->sum('amount');
            $releasedRepCount = (clone $repledgeQuery)->where('status', 'closed')->count();
            $releasedRepAmount = (clone $repledgeQuery)->where('status', 'closed')->sum('amount');
            $overdueRepCount = (clone $repledgeQuery)->where('status', 'open')->where('due_date', '<', Carbon::now())->count();
            $overdueRepAmount = (clone $repledgeQuery)->where('status', 'open')->where('due_date', '<', Carbon::now())->sum('amount');


            return response()->json([
                'loan_stats' => [
                    'total' => [
                        'count' => $activePledgeCount + $closedPledgeCount, // Approx Total
                        'principal' => $totalDisbursed,
                        'interest' => round($totalInterest)
                    ],
                    'active' => [
                        'count' => $activePledgeCount,
                        'principal' => $activePrincipal,
                        'interest' => round($activeAccruedInterest)
                    ],
                    'closed' => [
                        'count' => $closedPledgeCount,
                        'principal' => $closedPrincipal,
                        'interest' => round($closedInterest)
                    ],
                    'overdue' => [
                        'count' => $overdueCount,
                        'principal' => $overduePrincipal,
                        'interest' => round($overdueAccruedInterest)
                    ]
                ],
                'repledge_stats' => [ // Preserved
                    'total' => ['count' => $totalRepCount, 'amount' => $totalRepAmount],
                    'active' => ['count' => $activeRepCount, 'amount' => $activeRepAmount],
                    'released' => ['count' => $releasedRepCount, 'amount' => $releasedRepAmount],
                    'overdue' => ['count' => $overdueRepCount, 'amount' => $overdueRepAmount],
                ],
                'trends' => $trends,
                'branch_distribution' => $branchDistribution,
                'status_distribution' => $statusDistribution,
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard Stats Error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'error' => 'Failed to fetch settings',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
