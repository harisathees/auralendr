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

        // STRICT: If user is NOT developer, they CANNOT touch restricted groups
        if (!$request->user()->hasRole('developer')) {
            $restrictedPrefixes = ['user_privilege', 'brandkit', 'user', 'branch','loan'];
            
            // Filter input: Remove any restricted permissions from the input array
            $permissions = array_filter($permissions, function($perm) use ($restrictedPrefixes) {
                foreach ($restrictedPrefixes as $prefix) {
                    if (str_starts_with($perm, $prefix)) {
                        return false; 
                    }
                }
                return true;
            });
            
            // Staff should NEVER have these restricted permissions
            if ($role->name === 'staff') {
                $restrictedForStaff = ['user_privilege', 'brandkit', 'user', 'branch','loan'];
                
                $permissions = array_filter($permissions, function($perm) use ($restrictedForStaff) {
                    foreach ($restrictedForStaff as $prefix) {
                        if (str_starts_with($perm, $prefix)) return false;
                    }
                    return true;
                });
                // Re-index array
                $permissions = array_values($permissions);
            }    
            // Re-index
            $permissions = array_values($permissions);
            
            // IMPORTANT: We must also append any EXISTING restricted permissions 
            // the role already has, so we don't accidentally wipe them out.
            // (Since the UI won't send them, we need to preserve them)
            $existingPermissions = $role->permissions->pluck('name')->toArray();
            $existingRestricted = array_filter($existingPermissions, function($perm) use ($restrictedPrefixes) {
                foreach ($restrictedPrefixes as $prefix) {
                    if (str_starts_with($perm, $prefix)) {
                        return true;
                    }
                }
                return false;
            });
            
            // Merge allowed new input + existing restricted
            $permissions = array_unique(array_merge($permissions, $existingRestricted));
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

        // Enforce strict branch isolation
        $targetBranchId = $request->input('branch_id'); // Explicit input
        
        // If user is restricted (not dev/admin) and has branch, force it.
        // Assuming 'developer' and 'super-admin' can view all.
        $user = $request->user();
        if ($user->branch_id && !$user->hasRole('developer') && !$user->hasRole('admin')) {
            $targetBranchId = $user->branch_id;
        }

        $users = \App\Models\BranchAndUser\User::where('role', $role)
                    ->when($targetBranchId, function($q) use ($targetBranchId) {
                        return $q->where('branch_id', $targetBranchId);
                    })
                    ->with('permissions')
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

        // Enforce strict branch isolation
        if ($request->user()->branch_id && $user->branch_id !== $request->user()->branch_id) {
             return response()->json(['message' => 'Unauthorized: Cannot manage users from other branches'], 403);
        }

        $permissions = $request->permissions;

        // STRICT CHECK for User Permissions as well
        if (!$request->user()->hasRole('developer')) {
            $restrictedPrefixes = ['user_privilege', 'brandkit', 'user', 'branch'];
            
            // 1. Filter input to remove attempts to ADD restricted perms
            $permissions = array_filter($permissions, function($perm) use ($restrictedPrefixes) {
                foreach ($restrictedPrefixes as $prefix) {
                    if (str_starts_with($perm, $prefix)) return false;
                }
                return true;
            });
            
            // 2. Preserve existing restricted permissions the user might already have
            // (Unlikely for Staff, but critical safety if an Admin edits another Admin/Dev)
            $existingUserPerms = $user->permissions->pluck('name')->toArray();
            $existingRestricted = array_filter($existingUserPerms, function($perm) use ($restrictedPrefixes) {
                foreach ($restrictedPrefixes as $prefix) {
                    if (str_starts_with($perm, $prefix)) return true;
                }
                return false;
            });

             $permissions = array_unique(array_merge($permissions, $existingRestricted));
        }

        // Sync Direct Permissions
        $user->syncPermissions($permissions);

        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'message' => 'User permissions updated',
            'all_permission_names' => $user->getAllPermissions()->pluck('name')
        ]);
    }
}
