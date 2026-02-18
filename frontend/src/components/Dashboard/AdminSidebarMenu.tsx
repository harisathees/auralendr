
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { LogOut, Sun, Moon, LayoutDashboard, AlertCircle, User, Settings2, Camera, Loader2, Landmark } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Auth/AuthContext';
import { useTheme } from '../../context/Theme/ThemeContext';
import api from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { compressImage } from '../../utils/imageCompression';

interface AdminSidebarMenuProps {
    show: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ show, onClose, onLogout }) => {
    const { user, enableApprovals, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isUploading, setIsUploading] = useState(false);
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    if (!show && !isUploading) return null; // Keep rendered if uploading? No, just unmount usually. But show controls visibility.

    // If we want animation on unmount, we need to keep it mounted but hidden, or use AnimatePresence (framer-motion).
    // For now, we follow the existing pattern: conditional rendering in parent.
    // Wait, the parent does {showMenu && ...}. So this component receives show=true.
    // If we want to move the conditional into the component, we can.
    // Let's assume parent handles conditional rendering for now, or we handle it here if passed `show`.
    // The previous code had {showMenu && ( ... )}.
    // If I move the conditional inside, I can handle animation exit better later, but for now let's match existing behavior.

    // Actually, to make "overlaying" easy, let's just return null if !show used inside the component?
    // But usually typically standard is parent controls.

    // Let's replicate the structure.

    const getStorageUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
        return `${baseUrl}${url} `;
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;

        setIsUploading(true);
        try {
            const file = e.target.files[0];
            const compressed = await compressImage(file);

            const fd = new FormData();
            fd.append('name', user.name);
            fd.append('email', user.email);
            if (user.phone_number) {
                fd.append('phone_number', user.phone_number);
            }

            fd.append('files[]', compressed);
            fd.append('categories[]', 'profile_photo');

            await api.post('/me/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await refreshUser();
            toast.success("Profile photo updated successfully");
        } catch (error) {
            console.error("Profile photo upload failed:", error);
            toast.error("Failed to upload profile photo");
        } finally {
            setIsUploading(false);
        }
    };

    return ReactDOM.createPortal(
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300 pointer-events-auto"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className="fixed top-0 left-0 h-full w-80 max-w-[80vw] z-[9999] shadow-2xl p-6 flex flex-col animate-slide-in-left border-r border-gray-200 dark:border-gray-800 pointer-events-auto"
                style={{ backgroundColor: theme === 'dark' ? '#1A1D1F' : '#ffffff' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>

                <div className="flex flex-col items-center mb-8 mt-4">
                    <div className="w-24 h-24 rounded-full bg-[#FDB931] flex items-center justify-center text-black font-bold border-4 border-white dark:border-[#1A1D1F] overflow-hidden shrink-0 relative group mb-4 shadow-lg">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-black animate-spin" />
                        ) : user?.photo_url ? (
                            <img src={getStorageUrl(user.photo_url)} alt="Admin" className="w-full h-full object-cover" />
                        ) : (
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FDB931&color=000&size=128`} alt="Admin" />
                        )}

                        {/* Camera Overlay */}
                        {
                            !isUploading && (
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            )
                        }
                    </div >
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || "Admin"}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <p className="text-xs font-semibold text-primary mt-1 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
                    </div>
                </div >

                <div className="space-y-2 flex-1">
                    <Link
                        to="/admin/dashboard"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/dashboard')
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 ${isActive('/admin/dashboard') ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative z-10">Dashboard</span>
                        {isActive('/admin/dashboard') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        )}
                    </Link>

                    <Link
                        to="/admin/profile"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/profile')
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <User className={`w-5 h-5 transition-transform duration-300 ${isActive('/admin/profile') ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative z-10">Profile & Password</span>
                        {isActive('/admin/profile') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        )}
                    </Link>

                    {enableApprovals && (
                        <Link
                            to="/admin/approvals"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/approvals')
                                + ' ' + (isActive('/admin/approvals') ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')
                                }`}
                        >
                            {/* Wait, the className logic just above was manually weird, let's keep original logic but simple */}
                            {/* Actually, I should just paste the content exactly as it was but wrapped. I'll stick to original content logic. */}
                            <AlertCircle className={`w-5 h-5 transition-transform duration-300 ${isActive('/admin/approvals') ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="relative z-10">Approvals</span>
                            {isActive('/admin/approvals') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                            )}
                        </Link>
                    )}

                    <Link
                        to="/admin/finance/capital"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/finance/capital')
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <Landmark className={`w-5 h-5 transition-transform duration-300 ${isActive('/admin/finance/capital') ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative z-10">Capital</span>
                        {isActive('/admin/finance/capital') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        )}
                    </Link>

                    <Link
                        to="/admin/configs"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/configs')
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <Settings2 className={`w-5 h-5 transition-transform duration-300 ${isActive('/admin/configs') ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative z-10">Configuration</span>
                        {isActive('/admin/configs') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        )}
                    </Link>

                    <button
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 rounded-xl transition-colors"
                        onClick={toggleTheme}
                    >
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </div>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 rounded-xl transition-colors"
                        onClick={onLogout}
                    >
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <LogOut className="w-5 h-5" />
                        </div>
                        Sign Out
                    </button>
                </div>
            </div >
        </>,
        document.body
    );
};

export default AdminSidebarMenu;
