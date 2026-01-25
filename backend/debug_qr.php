<?php

use App\Models\Admin\Organization\Branch\Branch;
use App\Models\Pledge\Loan;
use App\Models\Pledge\Pledge;
use App\Models\CustomerApp\CustomerLoanTrack;
use App\Services\QrCodeService;

// Pick the latest loan/pledge to test
$pledge = Pledge::with(['loan', 'branch'])->latest()->first();

if (!$pledge) {
    echo "No pledges found.\n";
    exit;
}

echo "Checking Pledge ID: {$pledge->id}\n";
echo "Branch ID: {$pledge->branch_id}\n";

$branch = Branch::find($pledge->branch_id);
if ($branch) {
    echo "Branch Name: {$branch->branch_name}\n";
    echo "Enable Customer App: " . ($branch->enable_customer_app ? 'TRUE' : 'FALSE') . "\n";
    
    // Force enable for testing if false
    if (!$branch->enable_customer_app) {
        echo "Enabling feature for testing...\n";
        $branch->enable_customer_app = true;
        $branch->save();
        echo "Feature Enabled.\n";
    }
} else {
    echo "Branch not found!\n";
}

if ($pledge->loan) {
    echo "Loan ID: {$pledge->loan->id}\n";
    
    $track = CustomerLoanTrack::where('loan_id', $pledge->loan->id)->first();
    if ($track) {
        echo "Tracking Code: {$track->tracking_code}\n";
    } else {
        echo "Tracking Code: NOT FOUND\n";
    }

    $service = new QrCodeService();
    $qr = $service->generateForLoan($pledge->loan);
    
    if ($qr) {
        echo "QR Code Generation: SUCCESS (Length: " . strlen($qr) . ")\n";
        // echo "Preview: " . substr($qr, 0, 50) . "...\n";
    } else {
        echo "QR Code Generation: FAILED (Returned null)\n";
    }
} else {
    echo "Pledge has no loan.\n";
}
