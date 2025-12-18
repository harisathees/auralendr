import React, { useEffect, useState } from 'react';
import http from '../../../../../api/http';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../../../components/Shared/Toast';
import ConfirmationModal from '../../../../../components/Shared/ConfirmationModal';
import UserForm from './UserForm';
import type { User } from './UserForm';
import { useAuth } from '../../../../../context/AuthContext';
import { Lock } from 'lucide-react';

const List: React.FC = () => {
    const { can } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Action States
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Expanded Accordion State
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    // UI state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false,
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: number | null }>({
        isOpen: false,
        userId: null,
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const fetchUsers = async () => {
        if (!can('user.view')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await http.get('/staff');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleEdit = (user: User, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion toggle
        setEditingUser(user);
        setShowModal(true);
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion toggle
        setDeleteModal({ isOpen: true, userId: id });
    };

    const toggleAccordion = (id: number) => {
        setExpandedUserId(prev => prev === id ? null : id);
    };

    const confirmDelete = async () => {
        if (deleteModal.userId) {
            try {
                await http.delete(`/staff/${deleteModal.userId}`);
                showToast('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                showToast('Failed to delete user', 'error');
            } finally {
                setDeleteModal({ isOpen: false, userId: null });
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        showToast(editingUser ? 'User updated successfully' : 'User created successfully');
        fetchUsers();
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Delete User"
                message="Are you sure you want to delete this user? This account will no longer be able to log in."
                confirmLabel="Delete User"
                isDangerous={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, userId: null })}
            />

            {/* Header */}
            <header className="flex-none flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 shadow-sm border-b border-border-green/50 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary-text dark:text-white">arrow_back</span>
                </button>
                <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Manage Users</h2>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 p-4 pb-24">

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary-text dark:text-white">All Users</h3>
                    {can('user.create') ? (
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add User
                        </button>
                    ) : (
                        <button
                            disabled
                            className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed shadow-none flex items-center gap-2"
                            title="Permission denied"
                        >
                            <Lock className="w-4 h-4" />
                            Add User
                        </button>
                    )}
                </div>

                {/* List Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        <p className="text-sm font-medium text-gray-500">Loading users...</p>
                    </div>
                ) : !can('user.view') ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-surface dark:bg-gray-900 rounded-xl w-full border border-gray-100 dark:border-gray-800">
                            <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Access Denied
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You don't have permission to view users.
                            </p>
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
                        <span className="material-symbols-outlined text-5xl text-gray-300">group_off</span>
                        <p className="text-gray-500 font-medium">No users found</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={`
                                    bg-surface dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border transition-all duration-300
                                    ${expandedUserId === user.id ? 'border-primary ring-1 ring-primary/20' : 'border-border-green/30 hover:border-primary/50'}
                                `}
                            >
                                {/* Card Header (Always Visible) */}
                                <div
                                    onClick={() => toggleAccordion(user.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar / Initials */}
                                        <div className={`
                                            h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold
                                            ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-primary/10 text-primary'}
                                        `}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-primary-text dark:text-white text-sm sm:text-base">
                                                {user.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide
                                            ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}
                                        `}>
                                            {user.role}
                                        </span>
                                        <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${expandedUserId === user.id ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>
                                </div>

                                {/* Accordion Content (Collapsible) */}
                                <div className={`
                                    overflow-hidden transition-all duration-300 ease-in-out
                                    ${expandedUserId === user.id ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
                                `}>
                                    <div className="p-4 pt-0 border-t border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">

                                            {/* Branch Details */}
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">store</span>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {user.branch ? user.branch.branch_name : 'No Branch Assigned'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Extra Info (Placeholder for Created At or similar if available) */}
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">badge</span>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role Type</p>
                                                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                                                        {user.role} Access
                                                    </p>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            {can('user.update') ? (
                                                <button
                                                    onClick={(e) => handleEdit(user, e)}
                                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    Edit Profile
                                                </button>
                                            )}

                                            {can('user.delete') ? (
                                                <button
                                                    onClick={(e) => handleDeleteClick(user.id, e)}
                                                    className="px-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <UserForm
                    user={editingUser}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default List;
