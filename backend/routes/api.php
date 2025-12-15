<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\login\AuthController;
use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\pledge\PledgeController;
use App\Http\Controllers\Admin\JewelTypeController;
use App\Http\Controllers\Admin\JewelQualityController;
use App\Http\Controllers\Admin\TaskController;


Route::get('/test', function () {
    return response()->json(['status' => 'API Working']);
});

// Public Metal Rates
Route::get('/metal-rates', [App\Http\Controllers\Admin\MetalRateController::class, 'index']);

// FOR LOGIN
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::apiResource('branches', BranchController::class);
        Route::apiResource('staff', StaffController::class);
        Route::apiResource('tasks', TaskController::class);
        Route::apiResource('jewel-types', JewelTypeController::class);
        Route::apiResource('jewel-qualities', JewelQualityController::class);
        Route::apiResource('jewel-names', \App\Http\Controllers\Admin\JewelNameController::class);
        Route::post('/processing-fees', [App\Http\Controllers\Admin\ProcessingFeeController::class, 'store']);
    });

    // Shared Routes (Admin + Staff)
    Route::get('/jewel-types', [JewelTypeController::class, 'index']);
    Route::get('/jewel-qualities', [JewelQualityController::class, 'index']);
    Route::get('/jewel-names', [\App\Http\Controllers\Admin\JewelNameController::class, 'index']);
    Route::get('/processing-fees', [App\Http\Controllers\Admin\ProcessingFeeController::class, 'index']);
    Route::get('jewel-qualities', [JewelQualityController::class, 'index']);

    // Pledges
    Route::apiResource('pledges', PledgeController::class);

    // Metal Rates
    Route::post('/metal-rates', [App\Http\Controllers\Admin\MetalRateController::class, 'store']);

    // Money Sources
    Route::get('/money-sources', [App\Http\Controllers\Admin\MoneySourceController::class, 'index']);
    Route::post('/money-sources', [App\Http\Controllers\Admin\MoneySourceController::class, 'store']);
    Route::put('/money-sources/{id}', [App\Http\Controllers\Admin\MoneySourceController::class, 'update']);
    Route::delete('/money-sources/{id}', [App\Http\Controllers\Admin\MoneySourceController::class, 'destroy']);

    // Staff Task Routes
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
});

