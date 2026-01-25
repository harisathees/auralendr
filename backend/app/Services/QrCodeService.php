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
        $branch = Branch::find($branchId);
        if (!$branch || !$branch->enable_customer_app) {
            return null;
        }

        // 3. Get or Create Tracking Code
        $track = $this->getOrCreateTracking($loan, $branchId);

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
