import React from "react";

import type { ConfigItem } from "../../types/models";

interface ConfigListProps {
    title: string;
    items: ConfigItem[];
    loading: boolean;
    onAdd: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    itemNameKey?: string; // Key to display as main text, defaults to 'name'
    renderCustomItem?: (item: ConfigItem) => React.ReactNode;
}

const ConfigList: React.FC<ConfigListProps> = ({
    title,
    items,
    loading,
    onAdd,
    onEdit,
    onDelete,
    itemNameKey = 'name',
    renderCustomItem
}) => {
    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-primary-text dark:text-white">{title} List</h3>
                <button
                    onClick={onAdd}
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add New
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-secondary-text">Loading...</div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-secondary-text dark:text-gray-400">
                            No items found.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <div className="flex-1">
                                    {renderCustomItem ? renderCustomItem(item) : (
                                        <>
                                            <p className="font-medium text-primary-text dark:text-white">{item[itemNameKey]}</p>
                                            {item.description && <p className="text-xs text-secondary-text">{item.description}</p>}
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => onEdit(item.id)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ConfigList;
