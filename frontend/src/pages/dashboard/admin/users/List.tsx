import React, { useEffect, useState } from "react";
import http from "../../../../api/http";
import type { User } from "../../../../types/models";
import { useNavigate } from "react-router-dom";
import GoldCoinSpinner from "../../../../components/Shared/GoldCoinSpinner";

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = async () => {
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Staff & Admins</h2>
                <button
                    onClick={() => navigate("/admin/users/create")}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add User
                </button>
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
                                        <button
                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
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
