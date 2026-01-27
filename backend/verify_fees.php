<?php

use App\Models\Admin\LoanConfiguration\LoanProcessingFee;
use App\Models\Admin\LoanConfiguration\RepledgeFee;
use App\Models\Admin\JewelManagement\JewelType;
use Illuminate\Support\Facades\Schema;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "1. Checking Schema...\n";
if (Schema::hasColumn('processing_fees', 'branch_id')) {
    echo "ERROR: branch_id still exists in processing_fees!\n";
    exit(1);
} else {
    echo "PASS: branch_id removed from processing_fees.\n";
}

if (!Schema::hasTable('repledge_fees')) {
    echo "ERROR: repledge_fees table missing!\n";
    exit(1);
} else {
    echo "PASS: repledge_fees table exists.\n";
}

echo "\n2. Testing Models...\n";
// Get a jewel type or create one
$jewelType = JewelType::first();
if (!$jewelType) {
    $jewelType = JewelType::create(['name' => 'Test Gold', 'description' => 'Test']);
}

echo "Testing LoanProcessingFee for JewelType ID: {$jewelType->id}\n";
$fee = LoanProcessingFee::updateOrCreate(
    ['jewel_type_id' => $jewelType->id],
    ['percentage' => 1.5, 'max_amount' => 500]
);

if ($fee->percentage == 1.5 && $fee->max_amount == 500) {
    echo "PASS: LoanProcessingFee created/updated successfully.\n";
} else {
    echo "FAIL: LoanProcessingFee mismatch.\n";
}

echo "Testing RepledgeFee for JewelType ID: {$jewelType->id}\n";
$repledgeFee = RepledgeFee::updateOrCreate(
    ['jewel_type_id' => $jewelType->id],
    ['percentage' => 2.0, 'max_amount' => 1000]
);

if ($repledgeFee->percentage == 2.0 && $repledgeFee->max_amount == 1000) {
    echo "PASS: RepledgeFee created/updated successfully.\n";
} else {
    echo "FAIL: RepledgeFee mismatch.\n";
}

echo "\nVerification Complete.\n";
