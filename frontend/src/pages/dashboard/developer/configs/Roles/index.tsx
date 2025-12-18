import React, { useEffect, useState } from "react";
import http from "../../../../../api/http"; // Fixed path
import GoldCoinSpinner from "../../../../../components/Shared/GoldCoinSpinner";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../../context/AuthContext";
import { Lock } from "lucide-react";

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

const RolesIndex: React.FC = () => {
    const { can } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<{ [key: string]: Permission[] }>({});
    const [selectedRoleName, setSelectedRoleName] = useState<string>("staff");
    const [loading, setLoading] = useState(true);

    // User Permissions Logic
    const [roleUsers, setRoleUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const rolesRes = await http.get("/roles");
            const permsRes = await http.get("/permissions");
            setRoles(rolesRes.data);
            setAllPermissions(permsRes.data);
        } catch (error) {
            console.error("Failed to fetch roles/permissions", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleUsers = async () => {
        try {
            const res = await http.get(`/users-by-role?role=${selectedRoleName}`);
            setRoleUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Set default selected role when roles load
    useEffect(() => {
        if (roles.length > 0) {
            // Check if current selected is valid
            const exists = roles.find(r => r.name === selectedRoleName);
            if (!exists) {
                setSelectedRoleName(roles[0].name);
            }
        }
    }, [roles]);

    useEffect(() => {
        // When role changes, fetch users for that role and reset selection
        setSelectedUserId(null);
        fetchRoleUsers();
    }, [selectedRoleName]);

    const handleTogglePermission = async (permName: string) => {
        // If User Selected -> Update User
        if (selectedUserId) {
            const user = roleUsers.find(u => u.id === selectedUserId);
            if (!user) return;

            // Check if inherited from Role
            const role = roles.find(r => r.name === selectedRoleName);
            const isRolePerm = role?.permissions.some(p => p.name === permName);

            if (isRolePerm) {
                toast.error("Cannot disable permission inherited from Role");
                return;
            }

            // Toggle Direct Permission
            const currentDirect = user.permissions.map((p: any) => p.name);
            let newDirect: string[];

            if (currentDirect.includes(permName)) {
                newDirect = currentDirect.filter((p: string) => p !== permName);
            } else {
                newDirect = [...currentDirect, permName];
            }

            try {
                const res = await http.put(`/users/${user.id}/permissions`, { permissions: newDirect });
                // Update local state
                // We rely on 'all_permission_names' from response if available, or calc locally?
                // The backend response I wrote returns 'all_permission_names'.

                // Manually update the user in the list with new data
                setRoleUsers(prev => prev.map(u => {
                    if (u.id === user.id) {
                        // Update direct permissions locally
                        const updatedDirectObjs = newDirect.map(n => ({ name: n })); // Mock objects
                        // We prefer using the server response to be accurate
                        if (res.data.all_permission_names) {
                            return {
                                ...u,
                                permissions: updatedDirectObjs, // rough update 
                                all_permission_names: res.data.all_permission_names
                            };
                        }
                    }
                    return u;
                }));
                toast.success("User permissions updated");
            } catch (error) {
                toast.error("Failed to update user permissions");
            }
            return;
        }

        // Default: Update Role
        const role = roles.find(r => r.name === selectedRoleName);
        if (!role) return;

        const hasPermission = role.permissions.some(p => p.name === permName);
        let newPermissions = role.permissions.map(p => p.name);

        if (hasPermission) {
            newPermissions = newPermissions.filter(p => p !== permName);
        } else {
            newPermissions.push(permName);
        }

        try {
            await http.put(`/roles/${role.id}`, { permissions: newPermissions });

            // Optimistic update or refetch
            const updatedRoles = roles.map(r => {
                if (r.id === role.id) {
                    const updatedRolePerms = hasPermission
                        ? r.permissions.filter(p => p.name !== permName)
                        : [...r.permissions, { id: -1, name: permName, guard_name: 'sanctum' }]; // Mock obj
                    return { ...r, permissions: updatedRolePerms };
                }
                return r;
            });
            setRoles(updatedRoles);
            toast.success(`Permission ${hasPermission ? 'removed' : 'added'}`);
            fetchUsersForCurrentRole(); // Refetch users to update their inherited perms if needed? 
            // Actually changing role perms changes effective perms for all users of that role.
            // Ideally we refetch everything.
            fetchRoleUsers();

        } catch (error) {
            console.error("Failed to update permission", error);
            toast.error("Failed to update permission");
        }
    };

    // Helper to refresh users (aliased for clarity)
    const fetchUsersForCurrentRole = fetchRoleUsers;

    const handleToggleGroup = async (groupName: string) => {
        if (selectedUserId) {
            toast('Please toggle individual permissions for users', { icon: 'ℹ️' });
            return;
        }

        const role = roles.find(r => r.name === selectedRoleName);
        if (!role) return;

        const groupPerms = allPermissions[groupName] || [];
        const groupPermNames = groupPerms.map(p => p.name);

        // check if all are currently enabled
        const allEnabled = groupPermNames.every(name =>
            role.permissions.some(p => p.name === name)
        );

        let newPermissions = role.permissions.map(p => p.name);

        if (allEnabled) {
            newPermissions = newPermissions.filter(name => !groupPermNames.includes(name));
        } else {
            const remainingPerms = newPermissions.filter(name => !groupPermNames.includes(name));
            newPermissions = [...remainingPerms, ...groupPermNames];
        }

        try {
            await http.put(`/roles/${role.id}`, { permissions: newPermissions });
            fetchData(); // Simplest way to sync everything
            fetchRoleUsers();
            toast.success(`Group permissions ${allEnabled ? 'removed' : 'added'}`);
        } catch (error) {
            console.error("Failed to update group permissions", error);
            toast.error("Failed to update group permissions");
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading Privileges..." />;

    const selectedRole = roles.find(r => r.name === selectedRoleName);

    // Determine effective permissions for display
    const checkPermissionEnabled = (name: string) => {
        if (selectedUserId) {
            const user = roleUsers.find(u => u.id === selectedUserId);
            return user?.all_permission_names?.includes(name) || false;
        }
        return selectedRole?.permissions.some(p => p.name === name) || false;
    };

    return (
        <div className="p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white font-display">
                        User Privileges
                    </h1>
                    <p className="text-sm text-secondary-text dark:text-gray-400">
                        {selectedUserId
                            ? `Customizing permissions for user`
                            : `Manage global access rights for ${selectedRoleName}`}
                    </p>
                </div>

                {/* User Selector Dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Align for:</span>
                    <select
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedUserId || ""}
                        onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">All {selectedRoleName}s (Default)</option>
                        {roleUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex bg-card-light dark:bg-gray-800 rounded-lg p-1 mb-6 w-fit shadow-sm">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRoleName(role.name)}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all capitalize ${selectedRoleName === role.name
                            ? "bg-primary text-white shadow-md"
                            : "text-secondary-text dark:text-gray-400 hover:text-primary dark:hover:text-white"
                            }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(allPermissions)
                    .filter(([group]) => {
                        if (selectedRoleName === 'staff' && ['loan', 'branch', 'user', 'brandkit', 'repledge', 'user_privilege'].includes(group)) {
                            // Keep existing filter logic but maybe relax it if user wants to give extra rights?
                            // Currently specific groups are HIDDEN for staff.
                            // If we want to align permissions for a staff user to have 'brandkit', we must show it.
                            // Let's remove this hardcoded filter or make it conditional?
                            // For now, let's keep it consistent with previous logic, OR check if user is Custom.
                            // If a user is selected, maybe we show ALL groups so we can grant them?
                            if (selectedUserId) return true; // Allow seeing all groups when customizing a user
                            return !['loan', 'branch', 'user', 'brandkit', 'user_privilege'].includes(group);
                        }
                        return true;
                    })
                    .map(([group, perms]) => {
                        const groupPermNames = perms.map(p => p.name);
                        const allEnabled = groupPermNames.every(name => checkPermissionEnabled(name));

                        return (
                            <div key={group} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                                            {getIconForGroup(group)}
                                        </span>
                                        <h3 className="text-lg font-bold capitalize text-text-main dark:text-white">
                                            {group} Access
                                        </h3>
                                    </div>
                                    {!selectedUserId && (
                                        can('user_privilege.update') ? (
                                            <button
                                                onClick={() => handleToggleGroup(group)}
                                                className={`relative w-11 h-6 transition flex items-center rounded-full ${allEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
                                            >
                                                <span
                                                    className={`absolute w-4 h-4 rounded-full bg-white shadow transform transition-transform ${allEnabled ? "translate-x-6" : "translate-x-1"}`}
                                                />
                                            </button>
                                        ) : (
                                            <div className="relative w-11 h-6 flex items-center rounded-full bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed" title="You don't have permission to update roles">
                                                <span className="absolute w-4 h-4 rounded-full bg-gray-400 shadow transform translate-x-1 flex items-center justify-center">
                                                    <Lock className="w-2 h-2 text-white" />
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {perms.map(perm => {
                                        const isEnabled = checkPermissionEnabled(perm.name);
                                        // Visual distinction for Role vs Direct?
                                        // Complex to calculate here efficiently without extra lookups.
                                        // For now just toggle status.

                                        return (
                                            <div key={perm.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-text-main dark:text-gray-200">
                                                    </span>
                                                    <span className="text-xs text-secondary-text dark:text-gray-500">
                                                        {perm.name}
                                                    </span>
                                                </div>

                                                {can('user_privilege.update') ? (
                                                    <button
                                                        onClick={() => handleTogglePermission(perm.name)}
                                                        className={`relative w-11 h-6 transition flex items-center rounded-full ${isEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"
                                                                }`}
                                                        />
                                                    </button>
                                                ) : (
                                                    <div className={`relative w-11 h-6 flex items-center rounded-full opacity-50 cursor-not-allowed ${isEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`} title="You don't have permission to update roles">
                                                        <span className={`absolute w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"} flex items-center justify-center`}>
                                                            <Lock className="w-2 h-2 text-gray-400" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

// Helper to get icons
const getIconForGroup = (group: string) => {
    switch (group) {
        case 'pledge': return 'inventory_2';
        case 'repledge': return 'currency_exchange';
        case 'brandkit': return 'branding_watermark';
        case 'loan': return 'credit_score';
        case 'customer': return 'groups';
        case 'report': return 'bar_chart';
        case 'branch': return 'store';
        case 'user': return 'people';
        case 'user_privilege': return 'admin_panel_settings';
        default: return 'security';
    }
};


export default RolesIndex;
