<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->can('user_privilege.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = Role::with('permissions');
        
        // ALWAYS hide 'developer' role - it should be immutable via UI
        $query->where('name', '!=', 'developer');

        // If user is NOT developer (e.g. Admin), they can only see 'staff'
        // So hide 'admin' as well
        if (!$request->user()->hasRole('developer')) {
            $query->where('name', '!=', 'admin');
        }
        
        $roles = $query->get();
        return response()->json($roles);
    }

    public function getPermissions()
    {
        // ... existing implementation ...
        $permissions = Permission::all()->groupBy(function($item) {
            return explode('.', $item->name)[0]; 
        });
        return response()->json($permissions);
    }

    public function update(Request $request, Role $role)
    {
        // Protect 'developer' role from ANY changes
        if ($role->name === 'developer') {
            return response()->json(['message' => 'Developer role is immutable'], 403);
        }

        // Only developer can update admin permissions
        if ($role->name === 'admin' && !$request->user()->hasRole('developer')) {
             return response()->json(['message' => 'Only developers can manage admin privileges'], 403);
        }

        $permissions = $request->permissions;

        // Staff should NEVER have 'user_privilege' permissions (permissions to manage privileges)
        if ($role->name === 'staff') {
            $permissions = array_filter($permissions, function($perm) {
                return !str_starts_with($perm, 'user_privilege.');
            });
            // Re-index array
            $permissions = array_values($permissions);
        }

        $request->validate([
            'permissions' => 'array'
        ]);

        $role->syncPermissions($permissions);

        // Clear permission cache to ensure immediate effect
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'message' => 'Permissions updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    public function getUsersByRole(Request $request)
    {
        $role = $request->query('role');
        if (!$role) {
            return response()->json([]);
        }

        $users = \App\Models\BranchAndUser\User::where('role', $role)
                    ->with('permissions') // Direct permissions
                    ->get();

        // Attach effective permissions for UI
        $users->transform(function ($user) {
            $user->all_permission_names = $user->getAllPermissions()->pluck('name');
            return $user;
        });

        return response()->json($users);
    }

    public function updateUserPermissions(Request $request, \App\Models\BranchAndUser\User $user)
    {
        $request->validate([
            'permissions' => 'array'
        ]);

        // Sync Direct Permissions
        $user->syncPermissions($request->permissions);

        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'message' => 'User permissions updated',
            'all_permission_names' => $user->getAllPermissions()->pluck('name')
        ]);
    }
}
