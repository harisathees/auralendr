<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create head office branch
        $branch = Branch::firstOrCreate(
            ['branch_name' => 'Head Office'],
            ['location' => 'Main Office']
        );

        // Create super admin
        User::firstOrCreate(
            ['email' => 'admin@gamil.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('12345'),
                'role' => 'admin',
                'branch_id' => $branch->id
            ]
        );

        // Create staff
        User::firstOrCreate(
            ['email' => 'staff@gmail.com'],
            [
                'name' => 'staff',
                'password' => Hash::make('12345'),
                'role' => 'staff',
                'branch_id' => $branch->id
            ]
        );
    }
}
