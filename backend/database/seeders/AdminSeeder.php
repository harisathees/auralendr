<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BranchAndUser\User;
use App\Models\BranchAndUser\Branch;
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
            ['email' => 'admin@gmail.com'],
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

        // Create developer
        User::firstOrCreate(
            ['email' => 'developer@gmail.com'],
            [
                'name' => 'Developer',
                'password' => Hash::make('12345'),
                'role' => 'developer',
                'branch_id' => $branch->id
            ]
        );

        // Assign Spatie Roles
        $adminUser = User::where('email', 'admin@gmail.com')->first();
        if($adminUser) $adminUser->assignRole('admin');

        $staffUser = User::where('email', 'staff@gmail.com')->first();
        if($staffUser) $staffUser->assignRole('staff');
        
        $developerUser = User::where('email', 'developer@gmail.com')->first();
        if($developerUser) $developerUser->assignRole('developer');
    }
}
