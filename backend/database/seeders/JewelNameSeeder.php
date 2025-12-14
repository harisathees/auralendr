<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JewelNameSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            ['name' => 'Ring', 'slug' => 'ring'],
            ['name' => 'Chain', 'slug' => 'chain'],
            ['name' => 'Bangle', 'slug' => 'bangle'],
            ['name' => 'Necklace', 'slug' => 'necklace'],
            ['name' => 'Earring', 'slug' => 'earring'],
            ['name' => 'Bracelet', 'slug' => 'bracelet'],
            ['name' => 'Anklet', 'slug' => 'anklet'],
            ['name' => 'Pendant', 'slug' => 'pendant'],
            ['name' => 'Coin', 'slug' => 'coin'],
        ];

        DB::table('jewel_names')->insert(array_map(function ($n) {
            return array_merge($n, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, $names));
    }
}
