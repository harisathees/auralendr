<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\PendingApproval;
use App\Models\Pledge\Pledge;
use App\Models\Pledge\Loan;
use App\Models\Admin\MoneySource\MoneySource;
use App\Models\Transaction\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\ActivityService;

class ApprovalController extends Controller
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    /**
     * List all pending approvals
     */
    public function index(Request $request)
    {
        $approvals = PendingApproval::with(['pledge.customer', 'pledge.loan', 'requestedBy'])
            ->where('status', 'pending')
            ->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json($approvals);
    }

    /**
     * Approve a pending pledge
     */
    public function approve(Request $request, $id)
    {
        $approval = PendingApproval::findOrFail($id);
        $pledge = $approval->pledge;
        $loan = $pledge->loan;
        $user = $request->user();

        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Approval request is no longer pending.'], 400);
        }

        try {
            DB::transaction(function () use ($approval, $pledge, $loan, $user) {
                // 1. Update Approval Record
                $approval->update([
                    'status' => 'approved',
                    'reviewed_by' => $user->id
                ]);

                // 2. Update Pledge Status
                $pledge->update(['approval_status' => 'approved']);

                // 3. Deduct money if payment source exists
                if (!empty($loan->payment_method) && !empty($loan->amount_to_be_given)) {
                    $moneySource = MoneySource::where('name', $loan->payment_method)->first();
                    if ($moneySource) {
                        if ((float) $moneySource->balance < (float) $loan->amount_to_be_given) {
                            throw new \Exception("Insufficient balance in {$moneySource->name}. Available: {$moneySource->balance}");
                        }

                        $moneySource->decrement('balance', (float) $loan->amount_to_be_given);

                        // Create Transaction Record
                        Transaction::create([
                            'branch_id' => $pledge->branch_id,
                            'money_source_id' => $moneySource->id,
                            'type' => 'debit',
                            'amount' => $loan->amount_to_be_given,
                            'date' => now(),
                            'description' => "Loan Disbursment for Approved Pledge #{$pledge->id} (Cust: {$pledge->customer->name})",
                            'category' => 'loan',
                            'transactionable_type' => Loan::class,
                            'transactionable_id' => $loan->id,
                            'created_by' => $user->id,
                        ]);
                    }
                }

                $this->activityService->log('approve', "Approved Pledge #{$pledge->id} (Loan Amount Exceeded)", $pledge);
            });

            return response()->json(['message' => 'Pledge approved successfully.']);
        } catch (\Exception $e) {
            Log::error("Approval failed: " . $e->getMessage());
            return response()->json(['message' => 'Approval failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject a pending pledge
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['rejection_reason' => 'required|string|max:500']);

        $approval = PendingApproval::findOrFail($id);
        $pledge = $approval->pledge;
        $user = $request->user();

        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Approval request is no longer pending.'], 400);
        }

        $approval->update([
            'status' => 'rejected',
            'reviewed_by' => $user->id,
            'rejection_reason' => $request->rejection_reason
        ]);

        $pledge->update(['approval_status' => 'rejected']);

        $this->activityService->log('reject', "Rejected Pledge #{$pledge->id}: {$request->rejection_reason}", $pledge);

        return response()->json(['message' => 'Pledge rejected.']);
    }
}
