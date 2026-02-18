<?php

namespace App\Http\Controllers\Api\V1\Admin\Finance;

use App\Http\Controllers\Controller;
use App\Models\Admin\Finance\CapitalSource;
use App\Models\Admin\MoneySource\MoneySource;
use App\Models\Transaction\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CapitalSourceController extends Controller
{
    public function index()
    {
        $sources = CapitalSource::where('is_active', true)->get();

        // Calculate Global Metrics for Attribution
        $totalInvested = $sources->sum('total_invested');

        $interestFromPayments = \App\Models\Pledge\LoanPayment::sum('interest_amount');
        $interestFromClosures = \App\Models\Pledge\PledgeClosure::selectRaw('SUM(calculated_interest - COALESCE(interest_reduction, 0)) as total')->value('total') ?? 0;
        $totalGrowth = $interestFromPayments + $interestFromClosures;

        // Attribute Growth Pro-Rata
        $sources->transform(function ($source) use ($totalInvested, $totalGrowth) {
            if ($totalInvested > 0 && $source->total_invested > 0) {
                // Share of the pie
                $share = $source->total_invested / $totalInvested;
                $source->attributed_growth = round($share * $totalGrowth, 2);
            } else {
                $source->attributed_growth = 0;
            }
            return $source;
        });

        return $sources;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:owner,investor,bank_loan',
            'description' => 'nullable|string',
        ]);

        $source = CapitalSource::create($validated);
        return response()->json($source, 201);
    }

    public function update(Request $request, CapitalSource $capitalSource)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:owner,investor,bank_loan',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $capitalSource->update($validated);
        return response()->json($capitalSource);
    }

    public function destroy(CapitalSource $capitalSource)
    {
        $capitalSource->update(['is_active' => false]);
        return response()->json(['message' => 'Capital source deactivated']);
    }

    public function show(CapitalSource $capitalSource)
    {
        $capitalSource->load([
            'transactions' => function ($q) {
                $q->with('moneySource')->orderBy('date', 'desc')->orderBy('created_at', 'desc');
            }
        ]);
        return response()->json($capitalSource);
    }

    public function addCapital(Request $request)
    {
        $validated = $request->validate([
            'capital_source_id' => 'required|exists:capital_sources,id',
            'money_source_id' => 'required|exists:money_sources,id',
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $capitalSource = CapitalSource::findOrFail($validated['capital_source_id']);
            $moneySource = MoneySource::findOrFail($validated['money_source_id']);

            // 1. Create Transaction
            $transaction = Transaction::create([
                'money_source_id' => $moneySource->id,
                'type' => 'credit',
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'category' => 'capital_injection',
                'description' => $validated['description'] ?? "Capital injected from {$capitalSource->name}",
                'transactionable_type' => CapitalSource::class,
                'transactionable_id' => $capitalSource->id,
                'created_by' => $request->user()->id
            ]);

            // 2. Update Money Source Balance
            $moneySource->increment('balance', $validated['amount']);

            return response()->json([
                'message' => 'Capital added successfully',
                'transaction' => $transaction,
                'new_balance' => $moneySource->fresh()->balance
            ]);
        });
    }

    public function withdrawCapital(Request $request)
    {
        $validated = $request->validate([
            'capital_source_id' => 'required|exists:capital_sources,id',
            'money_source_id' => 'required|exists:money_sources,id',
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $capitalSource = CapitalSource::findOrFail($validated['capital_source_id']);
            $moneySource = MoneySource::findOrFail($validated['money_source_id']);

            if ($moneySource->balance < $validated['amount']) {
                return response()->json(['message' => 'Insufficient balance in selected money source'], 422);
            }

            // 1. Create Transaction (Debit)
            $transaction = Transaction::create([
                'money_source_id' => $moneySource->id,
                'type' => 'debit',
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'category' => 'capital_withdrawal',
                'description' => $validated['description'] ?? "Capital withdrawn to {$capitalSource->name}",
                'transactionable_type' => CapitalSource::class,
                'transactionable_id' => $capitalSource->id,
                'created_by' => $request->user()->id
            ]);

            // 2. Update Money Source Balance
            $moneySource->decrement('balance', $validated['amount']);

            return response()->json([
                'message' => 'Capital withdrawn successfully',
                'transaction' => $transaction,
                'new_balance' => $moneySource->fresh()->balance
            ]);
        });
    }

    public function getMetrics()
    {
        // 1. Total Capital Invested (Net)
        $capitalSources = CapitalSource::where('is_active', true)->get();
        $totalInvested = $capitalSources->sum('total_invested'); // Accessor logic handles credit - debit

        // 2. Total Growth (Interest Earned)
        // a. From Partial Payments
        $interestFromPayments = \App\Models\Pledge\LoanPayment::sum('interest_amount');

        // b. From Closures (Calculated Interest - Interest Reduction)
        $interestFromClosures = \App\Models\Pledge\PledgeClosure::selectRaw('SUM(calculated_interest - COALESCE(interest_reduction, 0)) as total')->value('total') ?? 0;

        $totalGrowth = $interestFromPayments + $interestFromClosures;

        return response()->json([
            'total_invested' => $totalInvested,
            'total_growth' => $totalGrowth,
            'roi' => $totalInvested > 0 ? ($totalGrowth / $totalInvested) * 100 : 0
        ]);
    }
}
