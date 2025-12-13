<?php

use App\Models\BranchAndUser\User;
use App\Models\pledge\Pledge;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::find(1);
if (!$user) {
    echo "User 1 not found\n";
    exit;
}

echo "User ID: " . $user->id . "\n";
echo "User Branch: " . ($user->branch_id ?? 'NULL') . "\n";
echo "Roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
echo "Has Admin Role: " . ($user->hasRole('admin') ? 'Yes' : 'No') . "\n";
echo "Can Update: " . ($user->can('pledge.update') ? 'Yes' : 'No') . "\n";

$pledge = Pledge::find(2);
if (!$pledge) {
    echo "Pledge 2 not found\n";
    exit;
}

echo "Pledge ID: " . $pledge->id . "\n";
echo "Pledge Branch: " . ($pledge->branch_id ?? 'NULL') . "\n";

if ($user->branch_id !== null && $user->branch_id === $pledge->branch_id && $user->can('pledge.update')) {
    echo "Policy Check: PASSED\n";
} else {
    echo "Policy Check: FAILED\n";
}
