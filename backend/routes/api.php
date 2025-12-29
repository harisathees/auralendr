<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Admin\Organization\Branch\BranchController;
use App\Http\Controllers\Api\V1\Admin\Organization\User\StaffController;
use App\Http\Controllers\Api\V1\Pledge\PledgeController;
use App\Http\Controllers\Api\V1\Repledge\RepledgeController;
use App\Http\Controllers\Api\V1\Transaction\TransactionController;
use App\Http\Controllers\Api\V1\Admin\Customer\CustomerController;
use App\Http\Controllers\Api\V1\Admin\Task\TaskController;
use App\Http\Controllers\Api\V1\Admin\Organization\UserPrivileges\RolePermissionController;
use App\Http\Controllers\Api\V1\Admin\Organization\UserPrivileges\StaffTimeRestrictionController;
use App\Http\Controllers\Api\V1\Admin\MoneySource\MoneySourceController;
use App\Http\Controllers\Api\V1\Admin\MoneySource\MoneySourceTypeController;
use App\Http\Controllers\Api\V1\Admin\Finance\MetalRateController;
use App\Http\Controllers\Api\V1\Admin\Finance\PaymentMethodController;
use App\Http\Controllers\Api\V1\Admin\Finance\RepledgeSourceController;
use App\Http\Controllers\Api\V1\Admin\Finance\TransactionCategoryController;
use App\Http\Controllers\Api\V1\Admin\JewelManagement\JewelTypeController;
use App\Http\Controllers\Api\V1\Admin\JewelManagement\JewelQualityController;
use App\Http\Controllers\Api\V1\Admin\JewelManagement\JewelNameController;
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\InterestRateController;
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\LoanController;
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\LoanProcessingFeeController;
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\ValidityMonthController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;

Route::get('/test', function () {
    return response()->json(['status' => 'API Working']);
});

// Public Metal Rates
Route::get('/metal-rates', [MetalRateController::class, 'index']);

// FOR LOGIN
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1');

Route::middleware(['auth:sanctum', 'check.time'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Developer Routes - Role & Permissions
    Route::get('/settings', [StaffTimeRestrictionController::class, 'index']);
    Route::post('/settings', [StaffTimeRestrictionController::class, 'update']);
    Route::get('/roles', [RolePermissionController::class, 'index']);
    Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::put('/roles/{role}', [RolePermissionController::class, 'update']);

    // User Permissions - select seperate user for give permissions
    Route::get('/users-by-role', [RolePermissionController::class, 'getUsersByRole']);
    Route::put('/users/{user}/permissions', [RolePermissionController::class, 'updateUserPermissions']);

    // Pledge Routes
    Route::post('pledges/{pledge}/close', [PledgeController::class, 'close']);
    Route::apiResource('pledges', PledgeController::class);

    // Repledge Routes
    Route::post('repledges/{repledge}/close', [RepledgeController::class, 'close']);
    Route::get('repledge-loans/search', [RepledgeController::class, 'searchLoan']);
    Route::apiResource('repledges', RepledgeController::class);

    // Permission Controlled Routes
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('staff', StaffController::class);


    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        Route::apiResource('tasks', TaskController::class);
        Route::apiResource('jewel-types', JewelTypeController::class);
        Route::apiResource('jewel-qualities', JewelQualityController::class);
        Route::apiResource('jewel-names', JewelNameController::class);
        Route::apiResource('interest-rates', InterestRateController::class);
        Route::apiResource('loan-validities', ValidityMonthController::class);
        Route::apiResource('payment-methods', PaymentMethodController::class);
        Route::apiResource('transaction-categories', TransactionCategoryController::class);
        Route::post('/processing-fees', [LoanProcessingFeeController::class, 'store']);
    });

    // Shared Routes (Admin + Staff)
    Route::get('/admin-all-loans', [LoanController::class, 'index']);

    // Read-only access for shared resources often needed by staff
    Route::get('/jewel-types', [JewelTypeController::class, 'index']);
    Route::get('/jewel-qualities', [JewelQualityController::class, 'index']);
    Route::get('/jewel-names', [JewelNameController::class, 'index']);
    Route::get('/interest-rates', [InterestRateController::class, 'index']);
    Route::get('/loan-validities', [ValidityMonthController::class, 'index']);
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::get('/processing-fees', [LoanProcessingFeeController::class, 'index']);
    Route::get('transaction-categories', [TransactionCategoryController::class, 'index']);

    // Loan Schemes
    Route::apiResource('loan-schemes', \App\Http\Controllers\Api\V1\Admin\LoanConfiguration\LoanSchemeController::class);
    // Loan Calculator
    Route::post('loan-calculator/calculate', [\App\Http\Controllers\Api\V1\LoanCalculatorController::class, 'calculate']);

    // Repledge Sources (Shared for read/write as configured in controller)
    Route::apiResource('repledge-sources', RepledgeSourceController::class);

    // Customer Search and List
    Route::get('/customers/search', [CustomerController::class, 'search']);
    Route::get('/customers', [CustomerController::class, 'index']);

    // Metal Rates (Admin write, Staff read - Controller handles specific logic if needed, or route middleware)
    Route::post('/metal-rates', [MetalRateController::class, 'store']);

    // Money Sources
    Route::get('/money-sources', [MoneySourceController::class, 'index']);
    Route::post('/money-sources', [MoneySourceController::class, 'store']);
    Route::put('/money-sources/{id}', [MoneySourceController::class, 'update']);
    Route::delete('/money-sources/{id}', [MoneySourceController::class, 'destroy']);
    Route::get('/money-source-types', [MoneySourceTypeController::class, 'index']);


    // Transactions
    Route::get('/transactions/report', [TransactionController::class, 'report']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Template Routes
    Route::get('/templates/receipt', [App\Http\Controllers\Api\V1\Admin\Configuration\TemplateController::class, 'getReceiptTemplate']);
    Route::post('/templates/receipt', [App\Http\Controllers\Api\V1\Admin\Configuration\TemplateController::class, 'updateReceiptTemplate']);

    // Staff Task Routes
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
});


