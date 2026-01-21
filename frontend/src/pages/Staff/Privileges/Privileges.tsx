import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WheelPicker from '../../../components/Shared/UI/WheelPicker/WheelPicker';
import WheelItem from '../../../components/Shared/UI/WheelPicker/WheelItem';
import MorphingIcon from '../../../components/Shared/UI/WheelPicker/MorphingIcon';

const Privileges: React.FC = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const privileges = [
        {
            id: 0,
            title: "Notices",
            subtitle: "Printing",
            description: "Generate and print loan notices",
            icon: "print",
            path: "/notices",
            color: "text-emerald-500 dark:text-emerald-400",
            glow: "bg-emerald-500/10"
        },
        {
            id: 1,
            title: "Rates",
            subtitle: "Update",
            description: "Update Gold & Silver daily prices",
            icon: "monitoring",
            path: "/privileges/metal-rates",
            color: "text-amber-500 dark:text-amber-400",
            glow: "bg-amber-500/10"
        },
        {
            id: 2,
            title: "Roles",
            subtitle: "Access",
            description: "Manage staff roles and permissions",
            icon: "person_pin",
            path: "#",
            color: "text-blue-500 dark:text-blue-400",
            glow: "bg-blue-500/10",
            disabled: true
        }
    ];

    const activePrivilege = privileges[activeIndex];

    return (
        <div className="fixed inset-0 bottom-[76px] flex flex-col items-center bg-gray-50 dark:bg-[#0F1113] overflow-hidden font-display select-none">

            {/* Main Center Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">

                <MorphingIcon
                    icon={activePrivilege.icon}
                    colorClass={activePrivilege.color}
                    glowClass={activePrivilege.glow}
                />

                {/* Horizontal Guide Line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent z-0" />

                <WheelPicker onActiveIndexChange={setActiveIndex}>
                    {privileges.map((p, i) => (
                        <WheelItem
                            key={p.id}
                            isActive={i === activeIndex}
                            onClick={() => !p.disabled && navigate(p.path)}
                        >
                            <div className="text-center">
                                <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                                    {p.title}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mt-3">
                                    {p.subtitle}
                                </p>

                                {i === activeIndex && (
                                    <div className="mt-6 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Press to Access</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                )}
                            </div>
                        </WheelItem>
                    ))}
                </WheelPicker>
            </div>

            {/* Background Details */}
            <div className="absolute top-12 left-12 flex flex-col pointer-events-none">
                <span className="text-[10px] font-black tracking-[0.5em] text-gray-400 dark:text-gray-600 uppercase">Auralendr Intelligence</span>
                <span className="text-xs font-bold text-primary opacity-50">Privileges.staff_v1</span>
            </div>

            <div className="absolute bottom-12 right-12 flex items-center gap-3 pointer-events-none">
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active State</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{activePrivilege.description}</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-600">verified_user</span>
            </div>

    
        </div>
    );
};

export default Privileges;
