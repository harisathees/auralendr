<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JewelType;
use Illuminate\Http\Request;

class JewelTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $types = JewelType::where('is_active', true)->get();
        return response()->json($types);
    }
}
