<?php

namespace App\Http\Controllers\Api\V1\Admin\JewelManagement;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\JewelManagement\JewelType;
use Illuminate\Http\Request;

class JewelTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $types = JewelType::all();
        return response()->json($types);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_types,name',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        $validated['is_active'] = true;

        $type = JewelType::create($validated);

        return response()->json($type, 201);
    }

    public function show(JewelType $jewelType)
    {
        return response()->json($jewelType);
    }

    public function update(Request $request, JewelType $jewelType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:jewel_types,name,' . $jewelType->id,
            'is_active' => 'boolean'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $jewelType->update($validated);
        return response()->json($jewelType);
    }

    public function destroy(JewelType $jewelType)
    {
        // Check for dependencies (loans, etc.) before deleting?
        // Ideally yes, but for now standard delete
        $jewelType->delete();
        return response()->json(null, 204);
    }
}
