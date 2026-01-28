<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check loans table
echo "Checking loans table for balance_amount:\n";
echo "==========================================\n\n";

$loans = DB::table('loans')
    ->select('id', 'loan_no', 'amount', 'balance_amount', 'status')
    ->limit(5)
    ->get();

foreach ($loans as $loan) {
    echo sprintf(
        "Loan: %s | Amount: %s | Balance: %s | Status: %s\n",
        $loan->loan_no ?? 'N/A',
        $loan->amount ?? 'NULL',
        $loan->balance_amount ?? 'NULL',
        $loan->status ?? 'N/A'
    );
}

echo "\n\nChecking for NULL balance_amounts:\n";
echo "===================================\n";

$nullCount = DB::table('loans')->whereNull('balance_amount')->count();
echo "Loans with NULL balance_amount: $nullCount\n";

echo "\n\nChecking loan_payments table:\n";
echo "==============================\n";

$payments = DB::table('loan_payments')
    ->select('id', 'loan_id', 'total_paid_amount', 'principal_amount', 'interest_amount', 'payment_date')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get();

foreach ($payments as $payment) {
    echo sprintf(
        "Payment ID: %s | Loan ID: %s | Total: %s | Principal: %s | Interest: %s | Date: %s\n",
        $payment->id,
        $payment->loan_id,
        $payment->total_paid_amount,
        $payment->principal_amount,
        $payment->interest_amount,
        $payment->payment_date
    );
}
