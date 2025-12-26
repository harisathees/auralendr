import React, { useEffect, useState, useMemo } from "react";
import api from "../../../../api/apiClient";
import type { User } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { Lock, Search, Users, ShieldCheck, UserCircle, Calendar, Mail, Store, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "../../../../context/Auth/AuthContext";

const UserList: React.FC = () => {
    const { can } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        if (!can('user.view')) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get("/staff");
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/staff/${id}`);
            setUsers(users.filter((u) => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Memoized counts for summary cards
    const stats = useMemo(() => {
        return {
            total: users.length,
            admins: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
            staff: users.filter(u => u.role === 'staff').length
        };
    }, [users]);

    // Client-side filtering
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.branch?.branch_name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
            case 'superadmin':
                return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'developer':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        }
    };

    if (loading) return <GoldCoinSpinner text="Loading Staff & Admins..." />;

    if (!can('user.view')) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-6">Staff & Admins</h2>
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Access Denied</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You don't have permission to view staff.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 lg:p-8 space-y-6 w-full">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                        Staff & Admins
                    </h2>
                    <p className="text-secondary-text dark:text-gray-400 mt-1 text-sm md:text-base">Manage your team and their access levels</p>
                </div>
                {can('user.create') ? (
                    <button
                        onClick={() => navigate("/admin/configs/users/create")}
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add New User
                    </button>
                ) : (
                    <button disabled className="bg-gray-200 dark:bg-gray-800 text-gray-400 px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed border border-gray-100 dark:border-gray-700 font-bold w-full sm:w-auto justify-center">
                        <Lock className="w-4 h-4" />
                        Add New User
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
                        <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stats.total}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 group hover:border-rose-300/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Administrators</p>
                        <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stats.admins}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 group hover:border-emerald-300/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff Members</p>
                        <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stats.staff}</h4>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                </div>
            </div>

            {/* Desktop Table section */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role & Status</th>
                                <th className="px-6 py-4">Assignment</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-sm">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{user.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border leading-none w-fit ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Active Now
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                                            <Store className="w-4 h-4 text-gray-400" />
                                            {user.branch?.branch_name || <span className="text-gray-400 font-normal italic">Unassigned</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            <Calendar className="w-4 h-4" />
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('user.update') ? (
                                                <button
                                                    onClick={() => navigate(`/admin/configs/users/edit/${user.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="p-2 text-gray-300 dark:text-gray-700 cursor-not-allowed">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            )}
                                            {can('user.delete') ? (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="p-2 text-gray-300 dark:text-gray-700 cursor-not-allowed">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-black border border-primary/20">
                                    {getInitials(user.name)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border leading-none ${getRoleColor(user.role)}`}>
                                {user.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 dark:border-gray-700/50">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    <Store className="w-3.5 h-3.5 text-gray-400" />
                                    {user.branch?.branch_name || "Unassigned"}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "-"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Now
                            </div>
                            <div className="flex gap-2">
                                {can('user.update') ? (
                                    <button
                                        onClick={() => navigate(`/admin/configs/users/edit/${user.id}`)}
                                        className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="p-2.5 text-gray-300 dark:text-gray-700 border border-gray-100 dark:border-gray-800 rounded-xl">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                                {can('user.delete') ? (
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="p-2.5 text-gray-300 dark:text-gray-700 border border-gray-100 dark:border-gray-800 rounded-xl">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No users found</h3>
                    <p className="text-secondary-text dark:text-gray-400 mt-1 max-w-xs mx-auto">
                        We couldn't find any users matching "{searchQuery}". Try a different search term.
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 text-primary font-bold hover:underline"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserList;
