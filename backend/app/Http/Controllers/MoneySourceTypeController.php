<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MoneySourceTypeController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\MoneySourceType::all());
    }
}
