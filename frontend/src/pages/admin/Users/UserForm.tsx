import React, { useEffect, useState } from 'react';
import http from '../../../api/http';

interface Branch {
    id: number;
    branch_name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    branch_id: number | null;
    branch?: Branch; // for display references
}

interface UserFormProps {
    user?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [branchId, setBranchId] = useState<number | ''>('');

    // Data sources
    const [branches, setBranches] = useState<Branch[]>([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await http.get('/branches');
                setBranches(response.data);
            } catch (err) {
                console.error("Failed to load branches", err);
            }
        };

        fetchBranches();

        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setBranchId(user.branch_id || '');
            // Password is kept blank for edits unless changing
        } else {
            // Defaults
            setName('');
            setEmail('');
            setPassword('');
            setRole('staff');
            setBranchId('');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload: any = {
                name,
                email,
                role,
                branch_id: role === 'admin' ? null : (branchId === '' ? null : Number(branchId)),
            };

            if (user) {
                // Update
                if (password) payload.password = password;
                await http.put(`/staff/${user.id}`, payload);
            } else {
                // Create
                payload.password = password;
                await http.post('/staff', payload);
            }

            onSuccess();
        } catch (err: any) {
            console.error("Error saving user:", err);
            if (err.response?.data?.errors) {
                const errorMsg = Object.values(err.response.data.errors).flat().join(', ');
                setError(errorMsg);
            } else {
                setError('Failed to save user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {user ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                            <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Password {user ? '(Leave blank to keep current)' : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            required={!user}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            placeholder={user ? "••••••••" : "Password"}
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`
                                flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                ${role === 'staff'
                                    ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
                            `}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="staff"
                                    checked={role === 'staff'}
                                    onChange={() => setRole('staff')}
                                    className="hidden"
                                />
                                <span className="material-symbols-outlined text-xl">badge</span>
                                <span className="font-medium">Staff</span>
                            </label>

                            <label className={`
                                flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                ${role === 'admin'
                                    ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
                            `}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={() => setRole('admin')}
                                    className="hidden"
                                />
                                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                                <span className="font-medium">Admin</span>
                            </label>
                        </div>
                    </div>

                    {/* Branch Selection - Only for Staff */}
                    {role === 'staff' && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Assigned Branch <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    value={branchId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBranchId(val === '' ? '' : Number(val));
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                                >
                                    <option value="">Select a Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                                    store
                                </span>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>
                    )}

                </form>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                        {user ? 'Save Changes' : 'Create User'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UserForm;
