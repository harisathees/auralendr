<?php

namespace App\Http\Controllers\Api\V1\Admin\MoneySource;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Controller;

class MoneySourceTypeController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Admin\MoneySource\MoneySourceType::all());
    }
}
