<?php

use Illuminate\Support\Facades\Schema;

echo "Checking 'branches' table...\n";
if (Schema::hasColumn('branches', 'enable_customer_app')) {
    echo "Column 'enable_customer_app' EXISTS in 'branches'. (CORRECT)\n";
} else {
    echo "Column 'enable_customer_app' MISSING in 'branches'. (FAIL)\n";
}

echo "Checking 'customer_loan_tracks' table...\n";
if (Schema::hasColumn('customer_loan_tracks', 'loan_ulid')) {
    echo "Column 'loan_ulid' EXISTS in 'customer_loan_tracks'. (FAIL)\n";
} else {
    echo "Column 'loan_ulid' DOES NOT EXIST in 'customer_loan_tracks'. (CORRECT)\n";
}
