<?php

use App\Services\LoanCalculatorService;
use App\Models\Admin\LoanConfiguration\LoanScheme;
use Carbon\Carbon;
use App\Models\Repledge\Repledge;
use App\Models\Admin\MoneySource\MoneySource;
use App\Models\User;

// 1. Test LoanCalculatorService
echo "--- Testing LoanCalculatorService ---\n";
$service = new LoanCalculatorService();
$scheme = LoanScheme::where('slug', 'scheme-1')->first(); // Tiered

if (!$scheme) {
    echo "Error: Scheme-1 not found. Run seeder.\n";
    exit;
}

$amount = 10000;
$startDate = Carbon::now()->subMonths(6);
$endDate = Carbon::now();

echo "Calculating for Amount: $amount, Scheme: {$scheme->name}\n";
$result = $service->calculate($scheme, $amount, $startDate, $endDate);
print_r($result);

// Test Scheme 4 (Day Basis Compound)
$scheme4 = LoanScheme::where('slug', 'scheme-4')->first();
if ($scheme4) {
    echo "Calculating Scheme 4 (Annual)...\n";
    $result4 = $service->calculate($scheme4, $amount, $startDate, $endDate);
    print_r($result4);
}

// 2. Test Repledge Closure Simulation
echo "\n--- Testing Repledge Closure Logic (Dry Run) ---\n";

// Find a repledge or create dummy
$repledge = Repledge::first();
if (!$repledge) {
    echo "No repledge found to test. Skipping closure test.\n";
} else {
    echo "Testing closure on Repledge ID: {$repledge->id}\n";

    $source = MoneySource::where('is_outbound', 1)->first();
    if (!$source) {
        $source = MoneySource::first(); // Fallback
    }

    if (!$source) {
        echo "No money source found.\n";
    } else {
        // Simulate DB Transaction logic manually without committing? 
        // Or just print what would happen.

        echo "Would debit Money Source: {$source->name} (Balance: {$source->balance})\n";
        echo "Would close Repledge {$repledge->id} with status 'closed'\n";
    }
}

echo "\nVerification Script Completed.\n";
