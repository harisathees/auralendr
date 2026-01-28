<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\CustomerLoanTrackController;
use App\Http\Middleware\EnsureCustomerAppEnabled;

Route::middleware([EnsureCustomerAppEnabled::class, 'throttle:10,1'])
    ->group(function () {
        Route::get('/check/{tracking_code}', [CustomerLoanTrackController::class, 'check']);
        Route::get('/track/{tracking_code}', [CustomerLoanTrackController::class, 'track']);
        Route::get('/all-pledges/{tracking_code}', [CustomerLoanTrackController::class, 'allPledges']);
    });
