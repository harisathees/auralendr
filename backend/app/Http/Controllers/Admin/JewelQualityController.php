<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JewelQuality;
use Illuminate\Http\Request;

class JewelQualityController extends Controller
{
    public function index()
    {
        return response()->json(JewelQuality::where('is_active', true)->get());
    }
}
