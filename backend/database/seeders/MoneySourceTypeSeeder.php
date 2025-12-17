<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MoneySourceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\MoneySourceType::firstOrCreate(['value' => 'cash'], [
            'name' => 'Cash',
            'icon' => 'payments'
        ]);

        \App\Models\MoneySourceType::firstOrCreate(['value' => 'bank'], [
            'name' => 'Bank Account',
            'icon' => 'account_balance'
        ]);

        \App\Models\MoneySourceType::firstOrCreate(['value' => 'wallet'], [
            'name' => 'Wallet / UPI',
            'icon' => 'account_balance_wallet'
        ]);
    }
}
