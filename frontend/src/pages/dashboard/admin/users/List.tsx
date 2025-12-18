import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { User } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/GoldCoinSpinner";
import { Lock } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

const UserList: React.FC = () => {
    const { can } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        if (!can('user.view')) {
            setLoading(false);
            return;
        }
        try {
            const res = await http.get("/staff");
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await http.delete(`/staff/${id}`);
            setUsers(users.filter((u) => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <GoldCoinSpinner text="Loading Staff..." />;

    if (!can('user.view')) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-6">Staff & Admins</h2>
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Access Denied
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You don't have permission to view staff.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Staff & Admins</h2>
                {can('user.create') ? (
                    <button
                        onClick={() => navigate("/admin/users/create")}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add User
                    </button>
                ) : (
                    <button
                        disabled
                        className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg shadow-sm cursor-not-allowed flex items-center gap-2"
                        title="Permission denied"
                    >
                        <Lock className="w-4 h-4" />
                        Add User
                    </button>
                )}
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-secondary-text dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Branch</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 font-display font-medium text-primary-text dark:text-white">{user.name}</td>
                                <td className="p-4 text-secondary-text dark:text-gray-400">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-secondary-text dark:text-gray-400">
                                    {user.branch?.branch_name || "-"}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {can('user.update') ? (
                                            <button
                                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-not-allowed"
                                                title="Edit denied"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}

                                        {can('user.delete') ? (
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-not-allowed"
                                                title="Delete denied"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-secondary-text dark:text-gray-400">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
