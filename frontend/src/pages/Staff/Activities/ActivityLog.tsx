import React, { useState, useEffect } from "react";
import Pagination from "../../../components/Shared/UI/Pagination";
import type { Activity } from "../../../types/Activity";
import { ActivityService } from "../../../services/ActivityService";
import { Loader2, Search, User, Activity as ActivityIcon, Filter, X } from "lucide-react";
import api from "../../../api/apiClient";
import type { User as UserType } from "../../../types/models";

const ActivityLog: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        user_id: "",
        action: ""
    });
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await ActivityService.getActivities({
                page,
                search,
                user_id: filters.user_id,
                action: filters.action
            });
            setActivities(response.data);
            setTotalPages(response.last_page);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("/staff?all=true");
            // Handle both array response and object with data property
            const userData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            // Filter out developer users
            setUsers(userData.filter((user: UserType) => user.role !== 'developer'));
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchActivities();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, search, filters]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ActivityIcon className="w-8 h-8 text-primary" />
                        Staff Activities
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track staff logins and critical actions</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-xl border transition-colors flex items-center gap-2 font-medium ${showFilters
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                >
                    <Filter className="w-5 h-5" />
                    <span className="hidden md:inline">Filters</span>
                    {(filters.user_id || filters.action) && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                </button>
            </div>

            {showFilters && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User</label>
                        <select
                            value={filters.user_id}
                            onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        >
                            <option value="">All Users</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="close">Close</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="close">Close</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ user_id: "", action: "" })}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                <th className="p-4">User</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : activities.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No activities found.
                                    </td>
                                </tr>
                            ) : (
                                activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {activity.user?.name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{activity.user?.name || "Unknown"}</span>
                                                    <span className="text-xs text-gray-500">{activity.user?.role || "Staff"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${activity.action === 'login' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30' :
                                                activity.action === 'logout' ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' :
                                                    activity.action === 'create' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30' :
                                                        activity.action === 'delete' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' :
                                                            'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                                }`}>
                                                {activity.action.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                                            {activity.description}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-gray-400">
                                            {activity.ip_address || "N/A"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/* Pagination */}
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default ActivityLog;
