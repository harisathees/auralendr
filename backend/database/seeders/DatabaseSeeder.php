<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminSeeder::class,
            JewelNameSeeder::class,
            JewelQualitySeeder::class,
            JewelTypeSeeder::class,
            MoneySourceTypeSeeder::class,
            LoanSchemaSeeder::class,
            
        ]); 
    }
}
