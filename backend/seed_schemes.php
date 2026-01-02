<?php

use App\Models\Admin\LoanConfiguration\LoanScheme;

$schemes = [
    [
        'name' => 'Scheme 1 (Maximum Interest)',
        'slug' => 'scheme-1',
        'interest_rate' => 2.00, // Base rate, surcharge is logic-based or can be configured
        'interest_period' => 'monthly',
        'calculation_type' => 'tiered', // Logic: base rate up to validity, then surcharge
        'scheme_config' => [
            'validity_months' => 12, // Default validity
            'surcharge_rate' => 2.50, // Interest + 0.5% usually
        ],
        'status' => 'active',
    ],
    [
        'name' => 'Scheme 2 (Minimum Interest)',
        'slug' => 'scheme-2',
        'interest_rate' => 2.00,
        'interest_period' => 'monthly',
        'calculation_type' => 'day_basis_tiered', // Special logic: <7 days 0.5m, <15 days 0.75m
        'scheme_config' => [
            'thresholds' => [
                ['days' => 7, 'fraction' => 0.5],
                ['days' => 15, 'fraction' => 0.75],
            ],
            'surcharge_rate' => 2.50,
        ],
        'status' => 'active',
    ],
    [
        'name' => 'Scheme 3 (Medium Interest)',
        'slug' => 'scheme-3',
        'interest_rate' => 2.00,
        'interest_period' => 'monthly',
        'calculation_type' => 'day_basis_tiered', // Logic: <10 days 0.5m
        'scheme_config' => [
            'thresholds' => [
                ['days' => 10, 'fraction' => 0.5],
            ],
            'surcharge_rate' => 2.50,
        ],
        'status' => 'active',
    ],
    [
        'name' => 'Scheme 4 (Day Basis)',
        'slug' => 'scheme-4',
        'interest_rate' => 24.00, // Annual rate 2% * 12
        'interest_period' => 'yearly',
        'calculation_type' => 'day_basis_compound', // Annual logic
        'scheme_config' => [
            'min_days' => 10, // Min 10 days interest
            'surcharge_rate' => 30.00, // Annual surcharge
        ],
        'status' => 'active',
    ],
];

foreach ($schemes as $data) {
    LoanScheme::updateOrCreate(['slug' => $data['slug']], $data);
}

echo "Schemes seeded successfully.\n";
