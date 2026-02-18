<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;
use App\Models\Pledge\Loan;
use App\Services\InterestCalculatorService;
use Carbon\Carbon;
use App\Models\Pledge\Pledge;
use App\Models\Pledge\LoanPayment;
use App\Models\Pledge\PledgeClosure;
use App\Models\Transaction\Transaction;
use App\Models\Admin\Finance\MetalRate;
use Illuminate\Pagination\Paginator;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportController extends Controller
{
    protected $interestService;

    public function __construct(InterestCalculatorService $interestService)
    {
        $this->interestService = $interestService;
    }

    public function getInterestVerification(Request $request)
    {
        $branchId = $request->query('branch_id');
        $status = $request->query('status', 'active'); // Default to active for interest verification usually

        $query = Loan::with(['pledge.customer', 'payments'])
            ->whereHas('pledge', function ($q) use ($branchId, $status, $request) {
                if ($branchId) {
                    $q->where('branch_id', $branchId);
                }

                // Filter by Date Range (Creation Date)
                if ($request->has('start_date')) {
                    $q->whereDate('created_at', '>=', $request->query('start_date'));
                }
                if ($request->has('end_date')) {
                    $q->whereDate('created_at', '<=', $request->query('end_date'));
                }

                // Filter by status if provided
                if ($status) {
                    if ($status === 'overdue') {
                        // Overdue Logic: Active AND Due Date passed
                        $q->where('status', 'active')->where('due_date', '<', now());
                    } else {
                        $q->where('status', $status);
                    }
                }
            });

        // Pagination
        $perPage = $request->query('per_page', 20);
        $loans = $query->paginate($perPage);

        // Transform collection to include calculation details
        $loans->getCollection()->transform(function ($loan) use ($status) {
            $calculation = $this->interestService->calculateAccruedInterest($loan);

            // For Closed Pledges, use the actual interest paid if available? 
            // Or show verification of what SHOULD have been paid?
            // Usually "Verification" implies checking the system calculation against reality or expected rules.
            // Let's stick to showing the System Calculation for now.

            // Append calculation details to the loan object (or a separate property)
            $loan->verification = $calculation;
            return $loan;
        });

        return response()->json($loans);
    }

    public function getRepledgeInterestVerification(Request $request)
    {
        $branchId = $request->query('branch_id');
        $status = $request->query('status', 'active');

        $query = \App\Models\Repledge\Repledge::with(['loan.pledge.customer', 'source']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        // Date Filters
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->query('start_date'));
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->query('end_date'));
        }

        // Status Filter
        if ($status) {
            if ($status === 'overdue') {
                $query->where('status', 'active')->where('due_date', '<', now());
            } else {
                $query->where('status', $status);
            }
        }

        $perPage = $request->query('per_page', 20);
        $repledges = $query->paginate($perPage);

        // Calculate generic interest for repledges (simple interest usually)
        $repledges->getCollection()->transform(function ($repledge) {
            $now = Carbon::now();
            $fromDate = Carbon::parse($repledge->start_date);

            // Logic similar to DashboardController
            if ($now->greaterThan($fromDate)) {
                $diffYears = $now->year - $fromDate->year;
                $diffMonths = $now->month - $fromDate->month;
                $months = $diffYears * 12 + $diffMonths;
                if ($now->day > $fromDate->day) {
                    $months++;
                }
                if ($months < 0)
                    $months = 0;
            } else {
                $months = 0;
            }

            $rate = $repledge->interest_percent ?? 0;
            $interest = $repledge->amount * ($rate / 100) * $months;

            $repledge->verification = [
                'start_date' => $fromDate->format('Y-m-d'),
                'end_date' => $now->format('Y-m-d'),
                'duration' => "{$months} Months",
                'rate' => "{$rate}%",
                'interest' => $interest,
                'balance' => $repledge->amount
            ];

            return $repledge;
        });

        return response()->json($repledges);
    }

    public function getBusinessOverviewVerification(Request $request)
    {
        $type = $request->query('type');
        $branchId = $request->query('branch_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $perPage = $request->query('per_page', 20);

        if (!$type) {
            return response()->json(['message' => 'Report type is required'], 400);
        }

        $data = [];

        switch ($type) {
            case 'portfolio':
                $query = Loan::with(['pledge.customer'])
                    ->where('status', 'active')
                    ->whereHas('pledge', function ($q) use ($branchId) {
                        if ($branchId)
                            $q->where('branch_id', $branchId);
                    });

                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
                $data = $query->latest()->paginate($perPage);
                break;

            case 'assets':
                $query = Pledge::with(['customer', 'jewels'])
                    ->where('status', 'active');

                if ($branchId)
                    $query->where('branch_id', $branchId);
                if ($startDate && $endDate)
                    $query->whereBetween('created_at', [$startDate, $endDate]);

                $data = $query->latest()->paginate($perPage);
                $goldRate = MetalRate::latest()->first()?->gold_rate_22ct ?? 0;
                $data->getCollection()->transform(function ($pledge) use ($goldRate) {
                    $pledge->asset_value = $pledge->total_net_weight * $goldRate;
                    return $pledge;
                });
                break;

            case 'customers':
                $query = \App\Models\Pledge\Customer::whereHas('pledges', function ($q) use ($branchId, $startDate, $endDate) {
                    if ($branchId)
                        $q->where('branch_id', $branchId);
                    if ($startDate && $endDate)
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                })->withCount('pledges');
                $data = $query->latest()->paginate($perPage);
                break;

            case 'gross_profit':
            case 'net_profit':
                // 1. Loan Payments (Interest)
                $payments = LoanPayment::with(['loan.pledge.customer'])
                    ->where('interest_amount', '>', 0);
                if ($branchId)
                    $payments->whereHas('loan.pledge', fn($q) => $q->where('branch_id', $branchId));
                if ($startDate && $endDate)
                    $payments->whereBetween('paid_date', [$startDate, $endDate]);

                // 2. Pledge Closures (Interest)
                $closures = PledgeClosure::with(['pledge.customer', 'pledge.loan'])
                    ->where('calculated_interest', '>', 0);
                if ($branchId)
                    $closures->whereHas('pledge', fn($q) => $q->where('branch_id', $branchId));
                if ($startDate && $endDate)
                    $closures->whereBetween('closed_date', [$startDate, $endDate]);

                $pCollection = $payments->get()->map(fn($i) => [
                    'id' => 'PAY-' . $i->id,
                    'date' => $i->paid_date,
                    'description' => "Interest Payment - Loan #" . ($i->loan->loan_no ?? 'N/A') . " (" . ($i->loan->pledge->customer->name ?? 'Unknown') . ")",
                    'type' => 'income',
                    'amount' => $i->interest_amount,
                    'category' => 'Interest Payment'
                ]);

                $cCollection = $closures->get()->map(fn($i) => [
                    'id' => 'CLS-' . $i->id,
                    'date' => $i->closed_date,
                    'description' => "Closure Interest - Loan #" . ($i->pledge->loan->loan_no ?? 'N/A') . " (" . ($i->pledge->customer->name ?? 'Unknown') . ")",
                    'type' => 'income',
                    'amount' => max(0, $i->calculated_interest - $i->interest_reduction - $i->additional_reduction),
                    'category' => 'Closure Interest'
                ]);

                $merged = $pCollection->concat($cCollection);

                if ($type === 'net_profit') {
                    // 3. Manual Expenses
                    $expenses = Transaction::where('type', 'debit')
                        ->whereNull('transactionable_type');
                    if ($branchId)
                        $expenses->where('branch_id', $branchId);
                    if ($startDate && $endDate)
                        $expenses->whereBetween('date', [$startDate, $endDate]);

                    $eCollection = $expenses->get()->map(fn($i) => [
                        'id' => 'EXP-' . $i->id,
                        'date' => $i->date,
                        'description' => $i->description,
                        'type' => 'expense',
                        'amount' => $i->amount,
                        'category' => 'Manual Expense'
                    ]);
                    $merged = $merged->concat($eCollection);
                }

                $merged = $merged->sortByDesc('date');
                $page = Paginator::resolveCurrentPage() ?: 1;
                $items = $merged->forPage($page, $perPage)->values();
                $data = new LengthAwarePaginator($items, $merged->count(), $perPage, $page, [
                    'path' => Paginator::resolveCurrentPath(),
                ]);
                break;
        }

        return response()->json($data);
    }
}
