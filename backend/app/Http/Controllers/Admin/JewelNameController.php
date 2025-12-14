<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JewelName;
use Illuminate\Http\Request;

class JewelNameController extends Controller
{
    public function index()
    {
        return response()->json(JewelName::where('is_active', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_names,name',
        ]);

        $jewelName = JewelName::create([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'is_active' => true,
        ]);

        return response()->json($jewelName, 201);
    }
}
