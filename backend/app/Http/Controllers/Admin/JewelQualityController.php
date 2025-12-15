<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JewelQuality;
use Illuminate\Http\Request;

class JewelQualityController extends Controller
{
    public function index()
    {
        return response()->json(JewelQuality::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_qualities,name',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = true;

        $quality = JewelQuality::create($validated);
        return response()->json($quality, 201);
    }

    public function show(JewelQuality $jewelQuality)
    {
        return response()->json($jewelQuality);
    }

    public function update(Request $request, JewelQuality $jewelQuality)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_qualities,name,' . $jewelQuality->id,
            'is_active' => 'boolean'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $jewelQuality->update($validated);
        return response()->json($jewelQuality);
    }

    public function destroy(JewelQuality $jewelQuality)
    {
        $jewelQuality->delete();
        return response()->json(null, 204);
    }
}
