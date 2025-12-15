<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MoneySource;
use Illuminate\Http\Request;

class MoneySourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Return all sources with branches, ordered by name
        return MoneySource::with('branches')->orderBy('name')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,wallet',
            'balance' => 'required|numeric',
            'description' => 'nullable|string',
            'is_outbound' => 'boolean',
            'is_inbound' => 'boolean',
            'is_active' => 'boolean',
            'show_balance' => 'boolean',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id'
        ]);

        $source = MoneySource::create($validated);

        if (isset($validated['branch_ids'])) {
            $source->branches()->sync($validated['branch_ids']);
        }

        return response()->json($source->load('branches'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return MoneySource::with('branches')->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $source = MoneySource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,wallet',
            'balance' => 'required|numeric',
            'description' => 'nullable|string',
            'is_outbound' => 'boolean',
            'is_inbound' => 'boolean',
            'is_active' => 'boolean',
            'show_balance' => 'boolean',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id'
        ]);

        $source->update($validated);

        if (isset($validated['branch_ids'])) {
            $source->branches()->sync($validated['branch_ids']);
        }

        return response()->json($source->load('branches'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $source = MoneySource::findOrFail($id);
        $source->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
