<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    public function getPermissions()
    {
        $permissions = Permission::all()->groupBy(function($item) {
            return explode('.', $item->name)[0]; // Group by 'pledge', 'loan', etc.
        });
        return response()->json($permissions);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'array'
        ]);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }
}
