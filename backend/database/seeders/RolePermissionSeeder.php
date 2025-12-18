<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions
        $perms = [
            'pledge.create',
            'pledge.view',
            'pledge.update',
            'pledge.delete',
            'loan.view_all_branches', // optional separate permission
            
            'repledge.create',
            'repledge.view',
            'repledge.update',
            'repledge.delete',

            'branch.create',
            'branch.view',
            'branch.update',
            'branch.delete',

            'user.create',
            'user.view',
            'user.update',
            'user.delete',

            'brandkit.create',
            'brandkit.view',
            'brandkit.delete',

            'user_privilege.view',
            'user_privilege.update',
        ];

        foreach ($perms as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'sanctum']);
        }

        // Roles - using sanctum guard for API
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'sanctum']);
        $developer = Role::firstOrCreate(['name' => 'developer', 'guard_name' => 'sanctum']);

        // Assign permissions
        $developer->givePermissionTo(Permission::all());
        $admin->givePermissionTo(Permission::all());
        $staff->givePermissionTo(['pledge.create','pledge.view','pledge.update']);

    }
}
