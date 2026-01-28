<?php

namespace App\Http\Controllers\Api\V1\Pledge;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Pledge\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    /**
     * Display the specified loan.
     */
    public function show(Loan $loan, Request $request)
    {
        // Check if user has permission to view this loan
        // Assuming loans are tied to pledges which have branch_id
        $user = $request->user();

        if (!$user->can('pledge.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // If not admin, ensure the loan belongs to user's branch
        if (!$user->hasRole('admin')) {
            $pledge = $loan->pledge;
            if (!$pledge || $pledge->branch_id !== $user->branch_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // Load necessary relationships
        $loan->load(['payments']);

        return response()->json($loan);
    }

    /**
     * Add extra amount to an existing loan.
     */
    public function addExtra(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'extra_amount' => 'required|numeric|min:1',
            'payment_method' => 'required|exists:money_sources,name',
            'notes' => 'nullable|string'
        ]);

        // Check permission
        $user = $request->user();
        if (!$user->can('pledge.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Initialize balance_amount if needed
        if ($loan->balance_amount === null) {
            $loan->balance_amount = $loan->amount;
        }

        // Calculate available limit
        $estimatedAmount = $loan->estimated_amount ?? 0;
        $availableLimit = $estimatedAmount - $loan->amount;

        // Validate against limit
        if ($availableLimit <= 0) {
            return response()->json([
                'message' => 'No extra limit available for this loan',
                'available_limit' => 0
            ], 422);
        }

        if ($validated['extra_amount'] > $availableLimit) {
            return response()->json([
                'message' => "Extra amount (₹{$validated['extra_amount']}) exceeds available limit of ₹{$availableLimit}",
                'available_limit' => $availableLimit
            ], 422);
        }

        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($loan, $validated, $request) {
                // Get money source
                $moneySource = \App\Models\Admin\MoneySource\MoneySource::where('name', $validated['payment_method'])->firstOrFail();

                // Check if outbound is allowed
                if (!$moneySource->is_outbound) {
                    throw new \Exception("The selected payment method '{$moneySource->name}' is not allowed for outbound transactions.");
                }

                // Check sufficient balance
                if ($moneySource->balance < $validated['extra_amount']) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'payment_method' => ["Insufficient balance in {$moneySource->name}. Available: ₹{$moneySource->balance}"]
                    ]);
                }

                // Update loan amounts
                $oldAmount = $loan->amount;
                $loan->amount += $validated['extra_amount'];
                $loan->balance_amount += $validated['extra_amount'];
                $loan->save();

                // Deduct from money source
                $moneySource->decrement('balance', $validated['extra_amount']);

                // Create Loan Extra Record
                $loanExtra = \App\Models\Pledge\LoanExtra::create([
                    'loan_id' => $loan->id,
                    'extra_amount' => $validated['extra_amount'],
                    'disbursement_date' => now(),
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'],
                    'created_by' => $request->user()->id
                ]);

                // Create transaction
                \App\Models\Transaction\Transaction::create([
                    'branch_id' => $request->user()->branch_id,
                    'money_source_id' => $moneySource->id,
                    'type' => 'debit',
                    'amount' => $validated['extra_amount'],
                    'date' => now(),
                    'description' => "Extra loan disbursement for Loan #{$loan->loan_no}" . ($validated['notes'] ? " - {$validated['notes']}" : ""),
                    'category' => 'loan',
                    'transactionable_type' => \App\Models\Pledge\LoanExtra::class, // Link to LoanExtra
                    'transactionable_id' => $loanExtra->id,
                    'created_by' => $request->user()->id,
                ]);

                // Create Activity Log
                \App\Models\Activity::create([
                    'user_id' => $request->user()->id,
                    'action' => 'extra_loan_disbursement',
                    'subject_type' => \App\Models\Pledge\LoanExtra::class,
                    'subject_id' => $loanExtra->id,
                    'description' => "Added extra loan amount of ₹{$validated['extra_amount']} to Loan #{$loan->loan_no}. New amount: ₹{$loan->amount}",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                \Illuminate\Support\Facades\Log::info("Extra amount added to loan", [
                    'loan_id' => $loan->id,
                    'old_amount' => $oldAmount,
                    'new_amount' => $loan->amount,
                    'extra_amount' => $validated['extra_amount'],
                    'loan_extra_id' => $loanExtra->id
                ]);

                return response()->json([
                    'message' => 'Extra amount added successfully',
                    'data' => $loan->fresh()->load('extras')
                ]);
            });
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error adding extra amount to loan: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to add extra amount',
                'error' => config('app.debug') ? $e->getMessage() : 'server_error'
            ], 500);
        }
    }
}
