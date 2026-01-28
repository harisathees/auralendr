<?php

use App\Models\CustomerApp\CustomerLoanTrack;
use App\Models\Settings;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Get a valid tracking code
$track = CustomerLoanTrack::first();

if (!$track) {
    echo "No CustomerLoanTrack found. Creating one for testing...\n";
    // Need a loan first
    $loan = \App\Models\Pledge\Loan::first();
    if (!$loan) {
        echo "No Loan found. Cannot test.\n";
        exit(1);
    }
    $branchId = $loan->pledge->branch_id;
    $track = CustomerLoanTrack::create([
        'loan_id' => $loan->id,
        'branch_id' => $branchId,
        'tracking_code' => \Illuminate\Support\Str::random(10)
    ]);
}

echo "Testing with Tracking Code: " . $track->tracking_code . "\n";
echo "Track Branch ID: " . $track->branch_id . "\n";

// 2. Simulate Middleware Logic
$branchId = $track->branch_id;

echo "Checking Branch Setting...\n";
$isEnabledBranch = Settings::where('branch_id', $branchId)
    ->where('key', 'enable_customer_app')
    ->value('value');

var_dump($isEnabledBranch);

echo "Checking Global Setting...\n";
$isEnabledGlobal = Settings::whereNull('branch_id')
    ->where('key', 'enable_customer_app')
    ->value('value');

var_dump($isEnabledGlobal);

// Logic from Middleware
$isEnabled = $isEnabledBranch;

if ($isEnabled === null) {
    echo "Branch setting is null, using global...\n";
    $isEnabled = $isEnabledGlobal;
}

echo "Final isEnabled Value: ";
var_dump($isEnabled);

$boolRequest = filter_var($isEnabled, FILTER_VALIDATE_BOOLEAN);
echo "Filter Var Result: " . ($boolRequest ? 'TRUE' : 'FALSE') . "\n";

if (!$boolRequest) {
    echo "FAIL: Middleware would abort 404.\n";
} else {
    echo "SUCCESS: Middleware would pass.\n";
}

// Check if any other global setting exists (maybe with branch_id=0 or empty string)
echo "\n--- DB Dump of 'enable_customer_app' ---\n";
$all = Settings::where('key', 'enable_customer_app')->get();
foreach ($all as $s) {
    echo "ID: {$s->id}, Val: '{$s->value}', BranchID: ";
    var_dump($s->branch_id);
}
