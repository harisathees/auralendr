<?php

namespace App\Http\Controllers\Api\V1\Pledge;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Loan;
use App\Models\Pledge\LoanPayment;
use App\Models\Admin\MoneySource\MoneySource;
use App\Models\Transaction\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoanPaymentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'loan_id' => 'required|exists:loans,id',
            'amount' => 'required|numeric|min:1',
            'interest_component' => 'required|numeric|min:0',
            'principal_component' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|exists:money_sources,name', // Name or ID? Usually Name in current system, checking logic... using Name for now to match PledgeController
            'notes' => 'nullable|string'
        ]);

        $loan = Loan::findOrFail($validated['loan_id']);

        // Initialize balance_amount if not set (for backward compatibility)
        if ($loan->balance_amount === null) {
            $loan->balance_amount = $loan->amount;
            $loan->save();
        }

        $totalAmount = $validated['amount'];
        $interestComp = $validated['interest_component'];
        $principalComp = $validated['principal_component'];

        // 1. Validate Consistency
        if (abs(($interestComp + $principalComp) - $totalAmount) > 0.01) {
            return response()->json(['message' => 'Interest + Principal must equal Total Amount'], 422);
        }

        // 2. Validate Principal against Balance
        if ($principalComp > $loan->balance_amount) {
            return response()->json([
                'message' => "Principal component ({$principalComp}) cannot exceed current loan balance ({$loan->balance_amount})"
            ], 422);
        }

        try {
            return DB::transaction(function () use ($validated, $loan, $request, $totalAmount, $interestComp, $principalComp) {
                // Determine Money Source
                $moneySource = MoneySource::where('name', $validated['payment_method'])->firstOrFail();

                // 1. Create Payment Record
                $payment = LoanPayment::create([
                    'loan_id' => $loan->id,
                    'total_paid_amount' => $totalAmount,
                    'interest_amount' => $interestComp,
                    'principal_amount' => $principalComp,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'],
                    'created_by' => $request->user()->id,
                ]);

                // 2. Handle Principal Reduction
                if ($principalComp > 0) {
                    $loan->decrement('balance_amount', $principalComp);
                    $loan->refresh(); // Refresh to get updated balance_amount
                }

                // 3. Handle Money Source (Income)
                $moneySource->increment('balance', $totalAmount);

                // 4. Create Transaction(s)
                // We can create one transaction for the total, or split them.
                // For simplicity and Dashboard Reporting, let's create ONE transaction linked to the Payment.
                // If dashboard needs split, it can query LoanPayment details.
                // However, transaction category might be useful.

                Transaction::create([
                    'branch_id' => $request->user()->branch_id, // Ensure user has branch_id
                    'money_source_id' => $moneySource->id,
                    'type' => 'credit',
                    'amount' => $totalAmount,
                    'date' => $validated['payment_date'],
                    'description' => "Partial Payment for Loan #{$loan->loan_no}",
                    'category' => 'loan_repayment',
                    'transactionable_type' => LoanPayment::class,
                    'transactionable_id' => $payment->id,
                    'created_by' => $request->user()->id,
                ]);

                // Create Activity Log
                \App\Models\Activity::create([
                    'user_id' => $request->user()->id,
                    'action' => 'partial_payment',
                    'subject_type' => Loan::class,
                    'subject_id' => $loan->id,
                    'description' => "Recorded partial payment of ₹{$totalAmount} (Principal: ₹{$principalComp}, Interest: ₹{$interestComp}) for Loan #{$loan->loan_no}",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'message' => 'Payment processed successfully',
                    'data' => $payment,
                    'new_balance' => $loan->fresh()->balance_amount
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error("Loan Payment Error: " . $e->getMessage());
            return response()->json(['message' => 'Failed to process payment', 'error' => $e->getMessage()], 500);
        }
    }
}
