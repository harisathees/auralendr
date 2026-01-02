import React from 'react';

interface WheelItemProps {
    isActive: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}

const WheelItem: React.FC<WheelItemProps> = ({ isActive, onClick, children, className = "" }) => {
    return (
        <div
            onClick={onClick}
            className={`flex-none w-[280px] h-48 flex flex-col items-center justify-center snap-center cursor-pointer px-4 will-change-transform transform-gpu transition-all duration-500 ${isActive ? 'scale-125 opacity-100 translate-y-12' : 'scale-90 opacity-20 translate-y-12 blur-[1px]'
                } ${className}`}
        >
            {children}
        </div>
    );
};

export default WheelItem;
