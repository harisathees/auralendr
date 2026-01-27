<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$fks = DB::select("
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = '" . DB::connection()->getDatabaseName() . "' 
    AND TABLE_NAME = 'processing_fees' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
");

print_r($fks);
