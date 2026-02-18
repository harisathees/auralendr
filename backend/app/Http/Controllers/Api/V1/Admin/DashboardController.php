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

            \Log::info('Dashboard Stats Request:', $request->all());

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


            // --- Repledge Stats ---
            $repledgeQuery = Repledge::query();
            if ($branchId)
                $repledgeQuery->where('branch_id', $branchId);
            if ($startDate && $endDate)
                $repledgeQuery->whereBetween('created_at', [$startDate, $endDate]);

            // Helper for Repledge Interest (similar to Loan)
            $calculateRepledgeInterest = function ($repledges) {
                $totalAccrued = 0;
                $now = Carbon::now();

                foreach ($repledges as $repledge) {
                    $fromDate = Carbon::parse($repledge->start_date); // Repledge start date

                    if ($now->lessThan($fromDate)) {
                        continue;
                    }

                    $diffYears = $now->year - $fromDate->year;
                    $diffMonths = $now->month - $fromDate->month;
                    $months = $diffYears * 12 + $diffMonths;

                    if ($now->day > $fromDate->day) {
                        $months++;
                    }

                    if ($months < 0)
                        $months = 0;

                    $rate = $repledge->interest_percent; // Field from Request validation
                    $amount = $repledge->amount;

                    $interest = $amount * ($rate / 100) * $months;
                    $totalAccrued += $interest;
                }
                return $totalAccrued;
            };

            // 1. Total Repledges (Filtered)
            $totalRepLoans = (clone $repledgeQuery)->get();
            $totalRepCount = $totalRepLoans->count();
            $totalRepAmount = $totalRepLoans->sum('amount');

            // 2. Active Repledges
            $activeRepQuery = (clone $repledgeQuery)->where('status', 'active');
            $activeRepLoans = $activeRepQuery->get();
            $activeRepCount = $activeRepLoans->count();
            $activeRepAmount = $activeRepLoans->sum('amount');
            $activeRepInterest = $calculateRepledgeInterest($activeRepLoans);

            // 3. Released (Closed) Repledges
            // Use RepledgeClosure for accurate interest paid
            $closedRepQuery = (clone $repledgeQuery)->where('status', 'closed');
            $closedRepLoans = $closedRepQuery->get();
            $releasedRepCount = $closedRepLoans->count();
            $releasedRepAmount = $closedRepLoans->sum('amount'); // Principal closed? Or Amount Paid? Usually Principal Volume.

            // Calculate Realized Interest from Closures (if date filtered, should match closure date?)
            // The main query filters by Created At. 
            // If user wants "Closed Interest" for repledges created in period? Or Closed in period?
            // "Closed Interest" usually means "Interest Realized in this period". 
            // But here, repledgeQuery is filtered by created_at.
            // Let's check matching logic for Loans. 
            // For Loans, "Closed Interest" was $realizedClosureInterest which filters by CLOSED DATE.
            // But "Closed Pledges" count filters by CREATED DATE in main logic?
            // Wait, existing logic:
            // $closedPledgeCount = Pledge::where('status', 'closed')...whereBetween('created_at'...)
            // $closedInterest = $realizedClosureInterest (which filters by CLOSED DATE).
            // This is mixed. 
            // Let's stick to the existing mixed logic for consistency: 
            // Count/Principal based on Creation (if filtered), Interest based on Realization (if filtered).
            // Actually, if dashboard filters are applied (Created Date), we should show Pledges created then.
            // But "Closed Interest" card implies income. Income is based on Payment Date.
            // Let's try to match:

            // Realized Repledge Interest (Closed Date Filter)
            $closedRepInterest = \App\Models\Repledge\RepledgeClosure::whereHas('repledge', function ($q) use ($branchId) {
                if ($branchId)
                    $q->where('branch_id', $branchId);
            })
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('closed_date', [$startDate, $endDate]);
                })
                ->sum('interest_paid');


            // 4. Overdue Repledges
            // Active + Due Date < Now
            // Remove Created At filter for Overdue to match Loan Logic?
            // Yes, user requested "All Overdue".
            $overdueRepQuery = Repledge::where('branch_id', $branchId ? $branchId : '!=', null) // Hack to handle optional branch
                ->when($branchId, function ($q) use ($branchId) {
                    $q->where('branch_id', $branchId);
                })
                ->where('status', 'active')
                ->where('due_date', '<', Carbon::now());

            $overdueRepLoans = $overdueRepQuery->get();
            $overdueRepCount = $overdueRepLoans->count();
            $overdueRepAmount = $overdueRepLoans->sum('amount');
            $overdueRepInterest = $calculateRepledgeInterest($overdueRepLoans);


            // 5. MANUAL EXPENSES (Transactions where transactionable_type is NULL and type is debit)
            $manualExpensesQuery = \App\Models\Transaction\Transaction::where('type', 'debit')
                ->whereNull('transactionable_type'); // Exclude system transactions like Loans, Repledges

            if ($branchId)
                $manualExpensesQuery->where('branch_id', $branchId);
            // For expenses, typically we look at Date (Transaction Date), not Created At
            if ($startDate && $endDate)
                $manualExpensesQuery->whereBetween('date', [$startDate, $endDate]);

            $totalManualExpenses = $manualExpensesQuery->sum('amount');


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
                'repledge_stats' => [
                    'total' => [
                        'count' => $totalRepCount,
                        'amount' => $totalRepAmount,
                        'interest' => round($activeRepInterest + $closedRepInterest) // Est Total Interest
                    ],
                    'active' => [
                        'count' => $activeRepCount,
                        'amount' => $activeRepAmount,
                        'interest' => round($activeRepInterest)
                    ],
                    'released' => [ // Mapping to 'closed'
                        'count' => $releasedRepCount,
                        'amount' => $releasedRepAmount,
                        'interest' => round($closedRepInterest)
                    ],
                    'overdue' => [
                        'count' => $overdueRepCount,
                        'amount' => $overdueRepAmount,
                        'interest' => round($overdueRepInterest)
                    ],
                ],
                // NEW: Business Business Overview Stats
                'business_stats' => [
                    'turnover' => $totalDisbursed, // Total Principal Disbursed
                    'net_profit' => round($totalPaidInterest - $totalManualExpenses), // Realized Interest - Manual Expenses
                    'collected_interest' => round($totalPaidInterest), // Realized Only
                    'manual_expenses' => round($totalManualExpenses), // Exposed for debugging/UI
                    'customers' => \App\Models\Pledge\Pledge::where(function ($q) use ($branchId, $startDate, $endDate) {
                        if ($branchId)
                            $q->where('branch_id', $branchId);
                        if ($startDate && $endDate)
                            $q->whereBetween('created_at', [$startDate, $endDate]);
                    })->distinct('customer_id')->count('customer_id'),
                    'assets_value' => $this->calculateAssetValue($branchId, $startDate, $endDate)
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

    /**
     * Calculate Total Asset Value based on Current Metal Rates
     * Returns: ['total_value' => X, 'gold' => ['weight' => Y, 'value' => Z], 'silver' => ...]
     */
    private function calculateAssetValue($branchId = null, $startDate = null, $endDate = null)
    {
        try {
            $rates = \App\Models\Admin\Finance\MetalRate::with('jewelType')->get();

            $stats = [
                'total_value' => 0,
                'gold' => ['weight' => 0, 'value' => 0],
                'silver' => ['weight' => 0, 'value' => 0]
            ];

            foreach ($rates as $rateObj) {
                if (!$rateObj->jewelType || !$rateObj->rate)
                    continue;

                $typeName = strtolower($rateObj->jewelType->name);
                $ratePerGram = $rateObj->rate;

                $metalKey = null;
                if (str_contains($typeName, 'gold'))
                    $metalKey = 'gold';
                elseif (str_contains($typeName, 'silver'))
                    $metalKey = 'silver';

                $weight = \App\Models\Pledge\Jewel::whereHas('pledge', function ($q) use ($branchId, $startDate, $endDate) {
                    if ($branchId)
                        $q->where('branch_id', $branchId);
                    if ($startDate && $endDate)
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                })
                    ->where('jewel_type', 'LIKE', "%{$typeName}%")
                    ->sum('net_weight');

                $value = $weight * $ratePerGram;

                if ($metalKey) {
                    $stats[$metalKey]['weight'] += $weight;
                    $stats[$metalKey]['value'] += $value;
                }

                $stats['total_value'] += $value;
            }

            return $stats;
        } catch (\Exception $e) {
            \Log::error("Asset Value Calc Error: " . $e->getMessage());
            return [
                'total_value' => 0,
                'gold' => ['weight' => 0, 'value' => 0],
                'silver' => ['weight' => 0, 'value' => 0]
            ];
        }
    }
}
