<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Branches: " . App\Models\BranchAndUser\Branch::count() . "\n";
echo "Users: " . App\Models\BranchAndUser\User::count() . "\n";
$branches = App\Models\BranchAndUser\Branch::all();
echo "Sample Branch: " . json_encode($branches->first()) . "\n";

$users = App\Models\BranchAndUser\User::all();
foreach ($users as $u) {
    echo "User [{$u->id}]: {$u->name} - Role: {$u->role}\n";
}
