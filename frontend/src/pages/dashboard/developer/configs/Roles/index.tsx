import React, { useEffect, useState } from "react";
import http from "../,,/../../../../../api/http"; // Adjusted path based on depth
import GoldCoinSpinner from "../../../../../components/Shared/GoldCoinSpinner";
import { toast } from "react-hot-toast";

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
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<{ [key: string]: Permission[] }>({});
    const [selectedRoleName, setSelectedRoleName] = useState<string>("staff");
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleTogglePermission = async (permName: string) => {
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
                    // Update the permissions list locally for UI response
                    // This is a simplified local update, ideal would be to use the response from server
                    const updatedRolePerms = hasPermission
                        ? r.permissions.filter(p => p.name !== permName)
                        : [...r.permissions, { id: -1, name: permName, guard_name: 'sanctum' }]; // Mock obj
                    return { ...r, permissions: updatedRolePerms };
                }
                return r;
            });
            setRoles(updatedRoles);
            toast.success(`Permission ${hasPermission ? 'removed' : 'added'}`);

            // Refetch to be sure (optional, can remove if UI flickers)
            fetchData();

        } catch (error) {
            console.error("Failed to update permission", error);
            toast.error("Failed to update permission");
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading Privileges..." />;

    const selectedRole = roles.find(r => r.name === selectedRoleName);

    return (
        <div className="p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white font-display">
                        User Privileges
                    </h1>
                    <p className="text-sm text-secondary-text dark:text-gray-400">
                        Manage access rights for staff and admins
                    </p>
                </div>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex bg-card-light dark:bg-gray-800 rounded-lg p-1 mb-6 w-fit shadow-sm">
                {['staff', 'admin'].map((role) => (
                    <button
                        key={role}
                        onClick={() => setSelectedRoleName(role)}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all capitalize ${selectedRoleName === role
                                ? "bg-primary text-white shadow-md"
                                : "text-secondary-text dark:text-gray-400 hover:text-primary dark:hover:text-white"
                            }`}
                    >
                        {role}
                    </button>
                ))}
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(allPermissions).map(([group, perms]) => (
                    <div key={group} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                                {getIconForGroup(group)}
                            </span>
                            <h3 className="text-lg font-bold capitalize text-text-main dark:text-white">
                                {group} Access
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {perms.map(perm => {
                                const isEnabled = selectedRole?.permissions.some(p => p.name === perm.name);
                                return (
                                    <div key={perm.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-main dark:text-gray-200">
                                                {formatPermissionName(perm.name)}
                                            </span>
                                            <span className="text-xs text-secondary-text dark:text-gray-500">
                                                {perm.name}
                                            </span>
                                        </div>

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
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to get icons
const getIconForGroup = (group: string) => {
    switch (group) {
        case 'pledge': return 'inventory_2';
        case 'loan': return 'credit_score';
        case 'customer': return 'groups';
        case 'report': return 'bar_chart';
        case 'user': return 'person';
        default: return 'security';
    }
};

// Helper to format name
const formatPermissionName = (name: string) => {
    const parts = name.split('.');
    if (parts.length > 1) {
        return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return name;
};

export default RolesIndex;
