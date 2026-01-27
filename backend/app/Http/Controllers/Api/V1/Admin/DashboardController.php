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
        try {
            $branchId = $request->query('branch_id');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            // Helper for basic filtering
            $applyFilters = function ($q) use ($branchId, $startDate, $endDate) {
                if ($branchId) $q->where('branch_id', $branchId);
                if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            };

            $applyLoanFilters = function ($q) use ($branchId, $startDate, $endDate) {
                $q->whereHas('pledge', function ($pq) use ($branchId, $startDate, $endDate) {
                    if ($branchId) $pq->where('branch_id', $branchId);
                    if ($startDate && $endDate) $pq->whereBetween('created_at', [$startDate, $endDate]);
                });
            };

            // 1. Total Loans
            $totalCount = Pledge::where(function($q) use ($branchId, $startDate, $endDate) {
                 if ($branchId) $q->where('branch_id', $branchId);
                 if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            // Total Disbursed Amount (Principal Given)
            $totalPrincipal = Loan::where(function($q) use ($branchId, $startDate, $endDate) {
                $q->whereHas('pledge', function ($pq) use ($branchId, $startDate, $endDate) {
                    if ($branchId) $pq->where('branch_id', $branchId);
                    if ($startDate && $endDate) $pq->whereBetween('created_at', [$startDate, $endDate]);
                });
            })->sum('amount');
            
            // Revenue: Total Interest (Closures + Partial Payments)
            // A. From Closures
            $interestFromClosures = Transaction::where('transactionable_type', 'App\Models\Pledge\PledgeClosure')
                ->where('category', 'loan_repayment') // Ensure category matches
                ->when($branchId, function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId);
                })
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                     $q->whereBetween('created_at', [$startDate, $endDate]);
                })
                ->sum('amount');
            // Wait, Closure transaction amount is Total Paid (Principal + Interest).
            // We need PURE INTEREST for revenue.
            // Transaction stores total amount paid.
            // We should sum `calculated_interest` from PledgeClosure table?
            // OR rely on Transaction metadata? Transaction doesn't split P/I.
            // Let's check PledgeClosure logic. `calculated_interest` is stored in `pledge_closures`.
            // But if we want *actually collected* interest...
            // Standard approach: Revenue = Interest Collected.
            // Let's use `interest_amount` from `loan_payments` + `calculated_interest` (adjusted) from `pledge_closures`.
            
            // Re-evaluating existing logic:
            // $totalInterest = Transaction::...sum('amount'); -> This was summing TOTAL transaction amount (Principal + Interest) as "Interest". This was WRONG previously if it included Principal returned.
            // Checking PledgeClosure transaction... It logs `amountPaid`.
            // FIX: We need to sum `calculated_interest` from Closures and `interest_amount` from LoanPayments.
            
            $interestFromClosures = \App\Models\Pledge\PledgeClosure::whereHas('pledge', function($q) use ($branchId, $startDate, $endDate) {
                if ($branchId) $q->where('branch_id', $branchId);
                // Date filter on Closure Date
                if ($startDate && $endDate) $q->whereBetween('closed_date', [$startDate, $endDate]);
            })->sum('calculated_interest'); // Use calculated_interest as realized revenue upon closure. 
            // Note: If `interest_reduction` exists, realized revenue is `calculated_interest - interest_reduction`.
            // Better: sum(calculated_interest - interest_reduction)
            
            $realizedClosureInterest = \App\Models\Pledge\PledgeClosure::whereHas('pledge', function($q) use ($branchId, $startDate, $endDate) {
                if ($branchId) $q->where('branch_id', $branchId);
                if ($startDate && $endDate) $q->whereBetween('closed_date', [$startDate, $endDate]);
            })->sum(DB::raw('calculated_interest - interest_reduction'));

            // B. From Partial Payments
            $interestFromPartial = \App\Models\Pledge\LoanPayment::whereHas('loan.pledge', function($q) use ($branchId) {
                if ($branchId) $q->where('branch_id', $branchId);
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                 $q->whereBetween('payment_date', [$startDate, $endDate]);
            })->sum('interest_amount');

            $totalInterest = $realizedClosureInterest + $interestFromPartial;


            // 2. Active Loans
            $activeCount = Pledge::where('status', 'active')->where(function($q) use ($branchId, $startDate, $endDate) {
                 if ($branchId) $q->where('branch_id', $branchId);
                 if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            // Active Principal (Outstanding Balance)
            $activePrincipal = Loan::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                $q->where('status', 'active');
                if ($branchId) $q->where('branch_id', $branchId);
                if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->sum('balance_amount'); // UPDATED: Use balance_amount

            // Note: Accrued interest is hard to calc on the fly without complex logic. Returning 0 for now.
            $activeInterest = 0; 


            // 3. Closed Loans
            $closedCount = Pledge::where('status', 'closed')->where(function($q) use ($branchId, $startDate, $endDate) {
                 if ($branchId) $q->where('branch_id', $branchId);
                 if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            $closedPrincipal = Loan::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                $q->where('status', 'closed');
                if ($branchId) $q->where('branch_id', $branchId);
                if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->sum('amount'); // For closed loans, we usually track original principal or recovered? 
                               // 'Principal' context in stats usually means 'Principal Returned'.
                               // So sum('amount') is correct for "Principal Closed/Recovered".

            $closedInterest = $realizedClosureInterest; 


            // 4. Overdue Loans
            // Logic: Active loans where due_date < now
            // FIX: Query should include status 'overdue' if implemented, or reliance on date.
            // Verification Report finding: "Overdue" status exists in Pledge but not Loan enum?
            // The dashboard bug logic: Pledge status becomes 'overdue', but query checks 'active'.
            // Updated Logic: Check Pledge status 'overdue' OR (active + date).
            
            $overdueLoansQuery = Loan::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                $q->where(function($sub) {
                    $sub->where('status', 'active')->orWhere('status', 'overdue');
                });
                
                if ($branchId) $q->where('branch_id', $branchId);
                if ($startDate && $endDate) $q->whereBetween('created_at', [$startDate, $endDate]);
            })->where('due_date', '<', Carbon::now());

            $overdueCount = (clone $overdueLoansQuery)->count();
            $overduePrincipal = (clone $overdueLoansQuery)->sum('balance_amount'); // UPDATED: Use balance_amount
            $overdueInterest = 0; // Placeholder


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
            $pledgeQuery = Pledge::query();
            if ($branchId) $pledgeQuery->where('branch_id', $branchId);
            if ($startDate && $endDate) $pledgeQuery->whereBetween('created_at', [$startDate, $endDate]);

            $statusDistribution = $pledgeQuery
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get();

            // --- Repledge Stats ---
            $repledgeQuery = Repledge::query();
            if ($branchId) $repledgeQuery->where('branch_id', $branchId);
            // Date filter for repledges (using created_at or start_date?) - Assuming created_at for consistency
            if ($startDate && $endDate) $repledgeQuery->whereBetween('created_at', [$startDate, $endDate]);
            
            // 1. Total Repledges
            $totalRepCount = (clone $repledgeQuery)->count();
            $totalRepAmount = (clone $repledgeQuery)->sum('amount');

            // 2. Active Repledges (Open)
            // Adjust status logic based on your Schema. Assuming 'open' or 'active'
            $activeRepCount = (clone $repledgeQuery)->where('status', 'open')->count();
            $activeRepAmount = (clone $repledgeQuery)->where('status', 'open')->sum('amount');

            // 3. Released Repledges (Closed)
            $releasedRepCount = (clone $repledgeQuery)->where('status', 'closed')->count();
            $releasedRepAmount = (clone $repledgeQuery)->where('status', 'closed')->sum('amount');

            // 4. Overdue Repledges
            // Active and past due date
            $overdueRepCount = (clone $repledgeQuery)
                ->where('status', 'open')
                ->where('due_date', '<', Carbon::now())
                ->count();
            $overdueRepAmount = (clone $repledgeQuery)
                ->where('status', 'open')
                ->where('due_date', '<', Carbon::now())
                ->sum('amount');

            return response()->json([
                'loan_stats' => [ // New structured key
                    'total' => [
                        'count' => $totalCount,
                        'principal' => $totalPrincipal,
                        'interest' => $totalInterest
                    ],
                    'active' => [
                        'count' => $activeCount,
                        'principal' => $activePrincipal,
                        'interest' => $activeInterest
                    ],
                    'closed' => [
                        'count' => $closedCount,
                        'principal' => $closedPrincipal,
                        'interest' => $closedInterest
                    ],
                    'overdue' => [
                        'count' => $overdueCount,
                        'principal' => $overduePrincipal,
                        'interest' => $overdueInterest
                    ]
                ],
                'repledge_stats' => [
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
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}
