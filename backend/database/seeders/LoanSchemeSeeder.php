<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin\LoanConfiguration\LoanScheme;

class LoanSchemeSeeder extends Seeder
{
    public function run()
    {
        $schemes = [
            [
                'name' => 'Scheme 1 (Maximum Interest)',
                'slug' => 'scheme-1',
                'interest_rate' => 2.00,
                'interest_period' => 'monthly',
                'calculation_type' => 'tiered',
                'scheme_config' => [
                    'validity_months' => 12,
                    'surcharge_rate' => 2.50,
                ],
                'status' => 'active',
            ],
            [
                'name' => 'Scheme 2 (Minimum Interest)',
                'slug' => 'scheme-2',
                'interest_rate' => 2.00,
                'interest_period' => 'monthly',
                'calculation_type' => 'day_basis_tiered',
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
                'calculation_type' => 'day_basis_tiered',
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
                'interest_rate' => 24.00,
                'interest_period' => 'yearly',
                'calculation_type' => 'day_basis_compound',
                'scheme_config' => [
                    'min_days' => 10,
                    'surcharge_rate' => 30.00,
                ],
                'status' => 'active',
            ],
        ];

        foreach ($schemes as $data) {
            LoanScheme::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
