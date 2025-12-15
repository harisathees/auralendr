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

    public function show(JewelName $jewelName)
    {
        return response()->json($jewelName);
    }

    public function update(Request $request, JewelName $jewelName)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_names,name,' . $jewelName->id,
            'is_active' => 'boolean'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $jewelName->update($validated);
        return response()->json($jewelName);
    }

    public function destroy(JewelName $jewelName)
    {
        $jewelName->delete();
        return response()->json(null, 204);
    }
}
