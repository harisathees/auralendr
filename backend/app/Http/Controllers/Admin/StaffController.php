<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BranchAndUser\User;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->can('user.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // include branch relationship for UI
        // include branch relationship for UI, sort by role (admin first) and then newness
        return User::with('branch')
            ->where('role', '!=', 'developer')
            ->orderBy('role', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        if (!$request->user()->can('user.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string',
            'branch_id' => 'nullable|exists:branches,id',
            'role' => 'required|in:staff,admin,developer'
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'branch_id' => $data['branch_id'] ?? null,
            'role' => $data['role']
        ]);

        return response()->json($user, 201);
    }

    public function show(User $staff, Request $request)
    {
        if (!$request->user()->can('user.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $staff->load('branch');
    }

    public function update(Request $request, User $staff)
    {
        if (!$request->user()->can('user.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $staff->id,
            'password' => 'nullable|string',
            'branch_id' => 'nullable|exists:branches,id',
            'role' => 'sometimes|required|in:staff,admin,developer'
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $staff->update($data);
        return response()->json($staff);
    }

    public function destroy(User $staff, Request $request)
    {
        if (!$request->user()->can('user.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $staff->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
