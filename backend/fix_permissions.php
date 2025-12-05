<?php

use App\Models\BranchAndUser\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::find(1);
if (!$user) {
    echo "User 1 not found\n";
    exit;
}

// Ensure admin role exists
$role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);

// Assign role
$user->assignRole($role);

echo "Assigned 'admin' role to User 1\n";
echo "Roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
