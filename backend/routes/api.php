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
    });

    // Staff endpoints (example)
    // Route::get('/branch/customers', [CustomerController::class,'index']); // to implement later
});

// Pledge routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Temporarily remove permission middleware to debug - will add back after fixing
    Route::get('pledges', [PledgeController::class, 'index']);
    Route::post('pledges', [PledgeController::class, 'store']);
    Route::get('pledges/{pledge}', [PledgeController::class, 'show']);
    Route::put('pledges/{pledge}', [PledgeController::class, 'update']);
    Route::delete('pledges/{pledge}', [PledgeController::class, 'destroy']);
    Route::get('jewel-types', [JewelTypeController::class, 'index']);
    Route::get('jewel-qualities', [JewelQualityController::class, 'index']);
    Route::get('jewel-types', [JewelTypeController::class, 'index']);
    Route::get('jewel-qualities', [JewelQualityController::class, 'index']);

    // Metal Rates
    Route::get('/metal-rates', [App\Http\Controllers\Admin\MetalRateController::class, 'index']);
    Route::post('/metal-rates', [App\Http\Controllers\Admin\MetalRateController::class, 'store']);

    // Staff Task Routes
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
});

