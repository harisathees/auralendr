<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BranchAndUser\Branch;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->can('branch.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return Branch::all();
    }

    public function store(Request $request)
    {
        if (!$request->user()->can('branch.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'branch_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $branch = Branch::create($data);
        return response()->json($branch, 201);
    }

    public function show(Branch $branch, Request $request)
    {
        if (!$request->user()->can('branch.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $branch;
    }

    public function update(Request $request, Branch $branch)
    {
        if (!$request->user()->can('branch.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'branch_name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $branch->update($data);
        return response()->json($branch);
    }

    public function destroy(Branch $branch, Request $request)
    {
        if (!$request->user()->can('branch.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $branch->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
