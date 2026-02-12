import React from "react";
import { useAuth } from "../../../../context/Auth/AuthContext";
import { useTheme } from "../../../../context/Theme/ThemeContext";
import {
    Calendar,
    Sun,
    Moon,
    User
} from "lucide-react";

interface StaffTopNavigationProps {
    selectedDate: string;
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dateInputRef: React.RefObject<HTMLInputElement>;
    onDateIconClick: () => void;
    onMenuClick: () => void;
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
    selectedDate,
    onDateChange,
    dateInputRef,
    onDateIconClick,
    onMenuClick
}) => {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pt-6 pb-4 border-b border-gray-100/50 dark:border-gray-800/50 transition-all duration-200">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center">
                        <div
                            className="flex items-center justify-center bg-primary/10 rounded-full size-10 cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                            onClick={onMenuClick}
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
