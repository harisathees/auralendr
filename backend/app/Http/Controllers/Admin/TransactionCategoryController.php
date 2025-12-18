<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransactionCategory;
use Illuminate\Http\Request;

class TransactionCategoryController extends Controller
{
    public function index()
    {
        $categories = TransactionCategory::orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:transaction_categories,name|max:255',
            'is_credit' => 'boolean',
            'is_debit' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $category = TransactionCategory::create([
            'name' => $validated['name'],
            'is_credit' => $validated['is_credit'] ?? false,
            'is_debit' => $validated['is_debit'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($category, 201);
    }

    public function show(string $id)
    {
        return TransactionCategory::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $category = TransactionCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:transaction_categories,name,' . $id,
            'is_credit' => 'boolean',
            'is_debit' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = TransactionCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
