import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string | number;
    label: string;
    subLabel?: string | null;
}

interface CustomDropdownProps {
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    icon?: string;
    disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className = "",
    icon = "expand_more",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value.toString() === value?.toString());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue.toString());
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left h-12 px-4 rounded-xl border transition-all duration-200 outline-none
                    ${isOpen
                        ? 'border-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30 bg-white dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'}
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : 'cursor-pointer'}
                `}
            >
                <div className="flex flex-col truncate">
                    <span className={`text-sm font-medium truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.subLabel && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate font-normal -mt-0.5">
                            {selectedOption.subLabel}
                        </span>
                    )}
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-600' : ''}`}>
                    {icon}
                </span>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-200 origin-top
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
            `}>
                <div className="max-h-68 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                                    ${(value?.toString() === option.value.toString())
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                `}
                            >
                                <div className="flex flex-col truncate">
                                    <span className="font-medium truncate">{option.label}</span>
                                    {option.subLabel && (
                                        <span className={`text-[11px] truncate ${value?.toString() === option.value.toString() ? 'text-purple-600/70 dark:text-purple-400/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {option.subLabel}
                                        </span>
                                    )}
                                </div>
                                {(value?.toString() === option.value.toString()) && (
                                    <span className="material-symbols-outlined text-lg ml-2 flex-shrink-0">check</span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No options available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomDropdown;
