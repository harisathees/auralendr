import React from 'react';

interface MorphingIconProps {
    icon: string;
    colorClass: string;
    glowClass: string;
}

const MorphingIcon: React.FC<MorphingIconProps> = ({ icon, colorClass, glowClass }) => {
    return (
        <div className="absolute top-1/2 -translate-y-[140px] z-20 pointer-events-none">
            <div className="relative group pointer-events-auto">
                {/* Glow Background */}
                <div className={`absolute -inset-12 blur-2xl transition-all duration-1000 opacity-40 rounded-full ${glowClass}`} />

                {/* Decorative Ring */}
                <div className="absolute -inset-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-full animate-spin-slow opacity-30" />

                {/* Icon Container (Reduced size, Icon fills) */}
                <div className="w-24 h-24 rounded-[1.8rem] bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 shadow-2xl flex items-center justify-center transition-all duration-700 transform hover:scale-110 active:scale-95 z-10 relative will-change-transform transform-gpu">
                    <span className={`material-symbols-outlined text-7xl transition-all duration-500 transform ${colorClass}`}>
                        {icon}
                    </span>
                </div>

                {/* Pointer Triangle */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-200 dark:bg-gray-800 transform rotate-45 opacity-20" />
            </div>
        </div>
    );
};

export default MorphingIcon;
