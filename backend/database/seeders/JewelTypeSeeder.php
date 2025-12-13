<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JewelTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Gold', 'slug' => 'gold'],
            ['name' => 'Silver', 'slug' => 'silver'],
            ['name' => 'Platinum', 'slug' => 'platinum'],
            ['name' => 'Diamond', 'slug' => 'diamond'],
        ];

        DB::table('jewel_types')->insert(array_map(function ($type) {
            return array_merge($type, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, $types));
    }
}
