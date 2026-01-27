import React, { useState } from "react";
import { useAuth } from "../../../../context/Auth/AuthContext";
import { useTheme } from "../../../../context/Theme/ThemeContext";
import {
    LogOut,
    Calendar,
    Sun,
    Moon,
    User,
    Camera,
    Loader2
} from "lucide-react";
import api from "../../../../api/apiClient";
import { compressImage } from "../../../../utils/imageCompression";

interface StaffTopNavigationProps {
    onLogout: () => void;
    selectedDate: string;
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dateInputRef: React.RefObject<HTMLInputElement | null>;
    onDateIconClick: () => void;
}

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-primary-text dark:text-gray-100"
        >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

const StaffTopNavigation: React.FC<StaffTopNavigationProps> = ({
    onLogout,
    selectedDate,
    onDateChange,
    dateInputRef,
    onDateIconClick
}) => {
    const { user, refreshUser } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;

        setIsUploading(true);
        try {
            const file = e.target.files[0];
            const compressed = await compressImage(file);

            const fd = new FormData();
            // Backend validation requires name and email
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
        } catch (error) {
            console.error("Profile photo upload failed:", error);
            // Ideally show a toast here
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pt-6 pb-4 border-b border-gray-100/50 dark:border-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center">
                        <div
                            className="flex items-center justify-center bg-primary/10 rounded-full size-10 cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            {user?.photo_url ? (
                                <img
                                    src={user.photo_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                    </div>

                    {/* Avatar Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute top-16 left-4 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="flex items-center justify-center bg-primary/10 rounded-full size-10 shrink-0 border border-gray-200 dark:border-gray-600 overflow-hidden">
                                            {isUploading ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                            ) : user?.photo_url ? (
                                                <img
                                                    src={user.photo_url}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-primary" />
                                            )}
                                        </div>

                                        {/* Camera Overlay */}
                                        {!isUploading && (
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                <Camera className="w-4 h-4 text-white" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handlePhotoUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {user?.name || "Nambirajan"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Staff Member
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                        setShowMenu(false);
                                        onLogout();
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col">
                        <p className="text-secondary-text dark:text-gray-400 text-sm font-medium leading-tight">
                            Welcome Back!
                        </p>
                        <h2 className="text-primary-text dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">
                            {user?.name || "Nambirajan"}
                        </h2>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-end gap-2">
                    <ThemeToggle />
                    <div className="relative">
                        <input
                            type="date"
                            ref={dateInputRef}
                            onChange={onDateChange}
                            className="absolute opacity-0 w-0 h-0 top-10 right-0"
                            style={{ visibility: "hidden", position: "absolute" }}
                        />
                        <button
                            onClick={onDateIconClick}
                            className={`flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full ${selectedDate
                                ? "bg-primary text-white"
                                : "bg-transparent text-primary-text dark:text-gray-100"
                                } transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StaffTopNavigation;
