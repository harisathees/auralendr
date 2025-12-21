import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import GoldCoinSpinner from "../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/Auth/AuthContext";
import { Lock } from "lucide-react";

import type { Role, Permission } from '../../types/models';

const RolesIndex: React.FC = () => {
    const { user, can } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<{ [key: string]: Permission[] }>({});
    const [selectedRoleName, setSelectedRoleName] = useState<string>("staff");
    const [loading, setLoading] = useState(true);

    // User Permissions Logic
    const [roleUsers, setRoleUsers] = useState<any[]>([]);

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // Branch Logic
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

    // Staff Login Time Settings
    const [staffTimeRestrictions, setStaffTimeRestrictions] = useState({ start: '09:00', end: '17:00' });
    const [loadingSettings, setLoadingSettings] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const rolesRes = await api.get("/roles");
            const permsRes = await api.get("/permissions");
            const branchesRes = await api.get("/branches");
            setRoles(rolesRes.data);
            setAllPermissions(permsRes.data);
            setBranches(branchesRes.data);
        } catch (error) {
            console.error("Failed to fetch roles/permissions", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleUsers = async () => {
        try {
            let url = `/users-by-role?role=${selectedRoleName}`;
            if (selectedBranchId) {
                url += `&branch_id=${selectedBranchId}`;
            }
            const res = await api.get(url);
            setRoleUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSettings = async () => {
        try {
            let url = '/settings?group=auth';
            if (selectedBranchId) {
                url += `&branch_id=${selectedBranchId}`;
            } else {
                url += `&branch_id=null`; // Explicitly ask for global
            }

            const res = await api.get(url);
            if (res.data) {
                setStaffTimeRestrictions({
                    start: res.data.staff_login_start_time || '09:00',
                    end: res.data.staff_login_end_time || '17:00'
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setLoadingSettings(true);

            await api.post('/settings', {
                group: 'auth',
                branch_id: selectedBranchId, // API handles null vs value
                settings: {
                    staff_login_start_time: staffTimeRestrictions.start,
                    staff_login_end_time: staffTimeRestrictions.end
                }
            });
            toast.success(selectedBranchId ? "Branch-specific login time saved" : "Global login time settings saved");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings");
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchRoleUsers();
    }, [selectedRoleName, selectedBranchId]); // Refetch users when branch changes

    useEffect(() => {
        if (selectedRoleName === 'staff') {
            fetchSettings();
        }
    }, [selectedRoleName, selectedBranchId]); // Refetch settings when branch changes

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
                const res = await api.put(`/users/${user.id}/permissions`, { permissions: newDirect });
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
            await api.put(`/roles/${role.id}`, { permissions: newPermissions });

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
            await api.put(`/roles/${role.id}`, { permissions: newPermissions });
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
                    <h1 className="text-2xl font-bold  dark:text-white font-display">
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
                        <option value="">
                            {selectedBranchId ? `All Branch ${selectedRoleName}s` : `All ${selectedRoleName}s (Global)`}
                        </option>
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
                        onClick={() => {
                            setSelectedRoleName(role.name);
                            setSelectedUserId(null); // Reset user selection when role changes
                        }}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all capitalize ${selectedRoleName === role.name
                            ? "bg-primary text-white shadow-md"
                            : "text-secondary-text dark:text-gray-400 hover:text-primary dark:hover:text-white"
                            }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            {/* Branch Selector (Only for Staff?) */}
            <div className="mb-6 w-64">
                <label className="text-xs font-bold text-gray-500 mb-2 block">Filter by Branch</label>
                <select
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    value={selectedBranchId || ''}
                    onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">All Branches (Global Settings)</option>
                    {branches.map((branch: any) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Staff Login Time Configuration Card */}
                {selectedRoleName === 'staff' && !selectedUserId && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-orange-600 bg-orange-100 p-2 rounded-lg">
                                schedule
                            </span>
                            <h3 className="text-lg font-bold dark:text-white">
                                Login Access Hours
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Restrict staff login access to specific working hours.
                                Staff attempting to login outside these hours will be denied access.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white "
                                        value={staffTimeRestrictions.start}
                                        onChange={(e) => setStaffTimeRestrictions({ ...staffTimeRestrictions, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                        value={staffTimeRestrictions.end}
                                        onChange={(e) => setStaffTimeRestrictions({ ...staffTimeRestrictions, end: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={loadingSettings || (!can('user_privilege.update') && user?.role !== 'developer')}
                                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loadingSettings ? 'Saving...' : 'Update Login Hours'}
                            </button>
                        </div>
                    </div>
                )}
                {Object.entries(allPermissions)
                    .filter(([group]) => {
                        const restrictedForNonDevs = ['user_privilege', 'brandkit', 'user', 'branch', 'loan'];

                        // 1. Strict check: non-developers CANNOT see these groups, period.
                        if (user?.role !== 'developer') {
                            if (restrictedForNonDevs.includes(group)) {
                                return false;
                            }
                        }

                        // 2. Strict Staff Check: Even developers shouldn't assign these to staff
                        // "for staff because the satff dont have this"
                        if (selectedRoleName === 'staff') {
                            const hiddenForStaff = ['branch', 'brandkit', 'user', 'user_privilege', 'loan'];
                            if (hiddenForStaff.includes(group)) {
                                return false;
                            }
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
                                        <h3 className="text-lg font-bold capitalize dark:text-white">
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
                                                    <span className="text-sm font-medium dark:text-gray-200">
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
