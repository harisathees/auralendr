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
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\RepledgeFeeController;
use App\Http\Controllers\Api\V1\Admin\LoanConfiguration\ValidityMonthController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\Configuration\BrandSettingsController;
use App\Http\Controllers\Api\V1\Admin\Configuration\ReceiptTemplateController;
use App\Http\Controllers\Api\V2\DeveloperSettingsController;
use App\Http\Controllers\Api\V1\Admin\Finance\CapitalSourceController;

Route::get('/test', function () {
    return response()->json(['status' => 'API Working']);
});



// Public Metal Rates
Route::get('/metal-rates', [MetalRateController::class, 'index']);

// FOR LOGIN
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1');

// Password Reset Routes
Route::post('/auth/forgot-password', [\App\Http\Controllers\Api\V1\Auth\PasswordResetController::class, 'sendOtp'])->middleware('throttle:3,10'); // 3 requests per 10 mins
Route::post('/auth/verify-otp', [\App\Http\Controllers\Api\V1\Auth\PasswordResetController::class, 'verifyOtp'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [\App\Http\Controllers\Api\V1\Auth\PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'check.time'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [\App\Http\Controllers\Api\V1\Auth\PasswordResetController::class, 'changePassword']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/me/profile', [AuthController::class, 'updateProfile']);
    Route::post('/me/send-otp', [\App\Http\Controllers\Api\V1\Auth\PasswordResetController::class, 'sendOtpForPasswordChange'])->middleware('throttle:3,10');

    // Developer Routes - Role & Permissions
    Route::get('/settings', [StaffTimeRestrictionController::class, 'index']);
    Route::post('/settings', [StaffTimeRestrictionController::class, 'update']);
    Route::get('/roles', [RolePermissionController::class, 'index']);
    Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::put('/roles/{role}', [RolePermissionController::class, 'update']);

    // Web Push Notification
    Route::get('/push/vapid-public-key', [\App\Http\Controllers\Api\V1\PushSubscriptionController::class, 'publicKey']);
    Route::post('/push/subscribe', [\App\Http\Controllers\Api\V1\PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [\App\Http\Controllers\Api\V1\PushSubscriptionController::class, 'unsubscribe']);

    // Approval Routes
    Route::middleware(['auth:sanctum', 'role:admin|superadmin|developer'])->group(function () {
        Route::get('/approvals', [\App\Http\Controllers\Api\V1\Admin\ApprovalController::class, 'index']);
        Route::post('/approvals/{id}/approve', [\App\Http\Controllers\Api\V1\Admin\ApprovalController::class, 'approve']);
        Route::post('/approvals/{id}/reject', [\App\Http\Controllers\Api\V1\Admin\ApprovalController::class, 'reject']);
    });


    // Developer Routes - For Controll CustomerApp
    Route::get('/developer/settings/resolve', [DeveloperSettingsController::class, 'resolve']);
    Route::get('/developer/settings', [DeveloperSettingsController::class, 'index']);
    Route::post('/developer/settings', [DeveloperSettingsController::class, 'update']);

    // User Permissions - select seperate user for give permissions
    Route::get('/users-by-role', [RolePermissionController::class, 'getUsersByRole']);
    Route::put('/users/{user}/permissions', [RolePermissionController::class, 'updateUserPermissions']);

    // Pledge Routes
    Route::post('pledges/{pledge}/close', [PledgeController::class, 'close']);
    Route::apiResource('pledges', PledgeController::class);

    // Loan Routes
    Route::get('loans/{loan}', [\App\Http\Controllers\Api\V1\Pledge\LoanController::class, 'show']);
    Route::post('loans/{loan}/add-extra', [\App\Http\Controllers\Api\V1\Pledge\LoanController::class, 'addExtra']);

    // Repledge Routes
    Route::post('repledges/{repledge}/close', [RepledgeController::class, 'close']);
    Route::get('repledge-loans/search', [RepledgeController::class, 'searchLoan']);
    Route::apiResource('repledges', RepledgeController::class);

    // Permission Controlled Routes
    Route::apiResource('branches', BranchController::class)->only(['index', 'show']);
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
        Route::post('/repledge-fees', [RepledgeFeeController::class, 'store']);

        // Customer Routes (Admin Only)
        Route::get('/customers/{id}/analysis', [CustomerController::class, 'analysis']);
        Route::get('/customers', [CustomerController::class, 'index']);

        // Data Backup
        Route::get('/backup/export', [\App\Http\Controllers\Api\V1\Admin\Backup\BackupController::class, 'export']);
    });

    // Shared Routes (Admin + Staff)
    Route::get('/admin-all-loans', [LoanController::class, 'index']);
    Route::get('/loans/{loanNo}', [LoanController::class, 'showByLoanNo']);

    // Read-only access for shared resources often needed by staff
    Route::get('/jewel-types', [JewelTypeController::class, 'index']);
    Route::get('/jewel-qualities', [JewelQualityController::class, 'index']);
    Route::get('/jewel-names', [JewelNameController::class, 'index']);
    Route::get('/interest-rates', [InterestRateController::class, 'index']);
    Route::get('/loan-validities', [ValidityMonthController::class, 'index']);
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::get('/processing-fees', [LoanProcessingFeeController::class, 'index']);
    Route::get('/repledge-fees', [RepledgeFeeController::class, 'index']);
    Route::get('/transaction-categories', [TransactionCategoryController::class, 'index']);

    // Customer Search (Shared)
    Route::get('/customers/search', [CustomerController::class, 'search']);

    // Loan Schemes
    Route::apiResource('loan-schemes', \App\Http\Controllers\Api\V1\Admin\LoanConfiguration\LoanSchemeController::class);
    // Loan Calculator
    Route::post('loan-calculator/calculate', [\App\Http\Controllers\Api\V1\LoanCalculatorController::class, 'calculate']);

    // Repledge Sources (Shared for read/write as configured in controller)
    Route::apiResource('repledge-sources', RepledgeSourceController::class);



    // Metal Rates (Admin write, Staff read - Controller handles specific logic if needed, or route middleware)
    Route::post('/metal-rates', [MetalRateController::class, 'store']);

    // Brand Settings
    Route::get('/brand-settings', [BrandSettingsController::class, 'index']);
    Route::post('/brand-settings', [BrandSettingsController::class, 'update'])->middleware('developer');

    // Money Sources
    Route::get('/money-sources', [MoneySourceController::class, 'index']);
    Route::post('/money-sources', [MoneySourceController::class, 'store']);
    Route::put('/money-sources/{id}', [MoneySourceController::class, 'update']);
    Route::delete('/money-sources/{id}', [MoneySourceController::class, 'destroy']);
    Route::get('/money-source-types', [MoneySourceTypeController::class, 'index']);

    // Capital Sources
    Route::get('/capital-sources/metrics', [CapitalSourceController::class, 'getMetrics']);
    Route::apiResource('capital-sources', CapitalSourceController::class);
    Route::post('/capital-sources/add-capital', [CapitalSourceController::class, 'addCapital']);
    Route::post('/capital-sources/withdraw-capital', [CapitalSourceController::class, 'withdrawCapital']);


    // Transactions
    Route::get('/transactions/report', [TransactionController::class, 'report']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Loan Payments
    Route::post('/loan-payments', [\App\Http\Controllers\Api\V1\Pledge\LoanPaymentController::class, 'store']);

    // Cash Reconciliation
    Route::get('/cash-reconciliation/today', [\App\Http\Controllers\Api\V1\Staff\CashReconciliationController::class, 'today']);
    Route::post('/cash-reconciliation', [\App\Http\Controllers\Api\V1\Staff\CashReconciliationController::class, 'store']);
    Route::get('/cash-reconciliation/history', [\App\Http\Controllers\Api\V1\Staff\CashReconciliationController::class, 'index']);
    // Activity Logs (Shared)
    Route::get('/activities', [\App\Http\Controllers\Api\V1\Admin\Activity\ActivityController::class, 'index']);

    // Template Routes
    Route::get('/templates/receipt', [App\Http\Controllers\Api\V1\Admin\Configuration\TemplateController::class, 'getReceiptTemplate']);
    Route::post('/templates/receipt', [App\Http\Controllers\Api\V1\Admin\Configuration\TemplateController::class, 'updateReceiptTemplate'])->middleware('developer');
    Route::apiResource('receipt-templates', ReceiptTemplateController::class)->middleware('developer');

    // Staff Task Routes
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);

    // Secure Media Serving
    Route::get('/media/{mediaFile}/stream', [App\Http\Controllers\Api\V1\MediaController::class, 'stream']);

    // Developer Only Routes
    Route::middleware('developer')->group(function () {
        Route::apiResource('branches', BranchController::class)->only(['store', 'update', 'destroy']);
    });
    // Report Routes
    Route::get('/reports/verification/business-overview', [\App\Http\Controllers\Api\V1\Admin\ReportController::class, 'getBusinessOverviewVerification']);
    Route::get('/reports/verification/interest', [\App\Http\Controllers\Api\V1\Admin\ReportController::class, 'getInterestVerification']);
    Route::get('/reports/verification/repledge-interest', [\App\Http\Controllers\Api\V1\Admin\ReportController::class, 'getRepledgeInterestVerification']);

    // Notification Routes
    Route::get('/notifications', [\App\Http\Controllers\Api\V1\Notification\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\V1\Notification\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\V1\Notification\NotificationController::class, 'markAllAsRead']);
});
