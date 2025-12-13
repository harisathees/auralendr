<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JewelQualitySeeder extends Seeder
{
    public function run(): void
    {
        $qualities = [
            ['name' => '24K', 'slug' => '24k'],
            ['name' => '22K', 'slug' => '22k'],
            ['name' => '18K', 'slug' => '18k'],
            ['name' => '14K', 'slug' => '14k'],
            ['name' => 'Silver', 'slug' => 'silver'],
        ];

        DB::table('jewel_qualities')->insert(array_map(function ($q) {
            return array_merge($q, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, $qualities));
    }
}
