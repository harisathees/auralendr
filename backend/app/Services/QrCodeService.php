<?php

namespace App\Services;

use App\Models\Admin\Organization\Branch\Branch;
use App\Models\CustomerApp\CustomerLoanTrack;
use App\Models\Pledge\Loan;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeService
{
    /**
     * Generate a QR code SVG for the given loan if the feature is enabled.
     *
     * @param Loan $loan
     * @return string|null SVG string or null if disabled/not found
     */
    public function generateForLoan(Loan $loan): ?string
    {
        // 1. Resolve Branch ID (Loan -> Pledge -> Branch)
        // Optimization: Eager load pledge if possible in controller, but handle lazy loading here safely.
        $branchId = $loan->pledge->branch_id ?? null;

        if (!$branchId) {
            return null;
        }

        // 2. Check Feature Flag

        // 2. Get or Create Tracking Code (ALWAYS generate, regardless of feature flag)
        $track = $this->getOrCreateTracking($loan, $branchId);

        // Ensure the relation is set on the loan object so it's included in the API response immediately
        if (!$loan->relationLoaded('customer_loan_track')) {
            $loan->setRelation('customer_loan_track', $track);
        }

        // 3. Check Feature Flag using Settings model
        $isEnabled = \App\Models\Settings::where('key', 'enable_customer_app')
            ->where('branch_id', $branchId)
            ->value('value');

        if (!$isEnabled || $isEnabled !== '1') {
            return null;
        }

        // 4. Generate QR Code
        // URL Format: https://customer.example.com/track/{tracking_code}
        // Base URL should ideally be in config, but using example as per requirements or ENV.
        $baseUrl = config('app.customer_app_url', 'https://customer.example.com');
        $url = "{$baseUrl}/track/{$track->tracking_code}";

        return QrCode::size(150)->generate($url);
    }

    /**
     * Get existing tracking record or create a new deterministic one.
     */
    public function getOrCreateTracking(Loan $loan, string $branchId): CustomerLoanTrack
    {
        // Check if exists
        $track = CustomerLoanTrack::where('loan_id', $loan->id)->first();

        if ($track) {
            return $track;
        }

        // Create new
        // Generate a secure, non-guessable tracking code
        // Using ULID or Random String. Requirement: deterministic? 
        // "3. The QR code must be deterministic and reproducible"
        // This means for the same loan, it should always be the same. 
        // If we store it in DB, reading it back satisfies "deterministic" from the user perspective (always get same QR).

        $trackingCode = Str::random(16); // 16 chars random string is sufficient for tracking code

        return CustomerLoanTrack::create([
            'loan_id' => $loan->id,
            'branch_id' => $branchId,
            'tracking_code' => $trackingCode,
        ]);
    }
}
