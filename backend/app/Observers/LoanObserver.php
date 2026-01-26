<?php

namespace App\Observers;

use App\Models\Pledge\Loan;
use App\Models\Admin\Organization\Branch\Branch;
use App\Models\CustomerApp\CustomerLoanTrack;
use Illuminate\Support\Str;

class LoanObserver
{
    /**
     * Handle the Loan "created" event.
     */
    public function created(Loan $loan): void
    {
        // Resolve Branch ID
        // Note: Loan belongs to Pledge, Pledge belongs to Branch.
        // We need to load pledge to get branch_id.
        $loan->load('pledge');
        $branchId = $loan->pledge->branch_id ?? null;

        if (!$branchId) {
            return;
        }

        // Check Feature Flag - REMOVED to ensure tracking is always created
    
        $branch = Branch::find($branchId);
        if (!$branch || !$branch->enable_customer_app) {
           return;
        }
        

        // Create Tracking Record
        // Deterministic check: ensuring we don't duplicate if for some reason observer fires twice
        if (!CustomerLoanTrack::where('loan_id', $loan->id)->exists()) {
            CustomerLoanTrack::create([
                'loan_id' => $loan->id,
                'branch_id' => $branchId,
                'tracking_code' => Str::random(16),
            ]);
        }
    }

    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        //
    }

    /**
     * Handle the Loan "deleted" event.
     */
    public function deleted(Loan $loan): void
    {
        //
    }

    /**
     * Handle the Loan "restored" event.
     */
    public function restored(Loan $loan): void
    {
        //
    }

    /**
     * Handle the Loan "force deleted" event.
     */
    public function forceDeleted(Loan $loan): void
    {
        //
    }
}
