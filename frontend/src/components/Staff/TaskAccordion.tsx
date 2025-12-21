import React, { useState } from 'react';
import type { Task } from '../../types/models';
import api from '../../api/apiClient';

interface TaskAccordionProps {
    task: Task;
    onUpdate: () => void;
}

const TaskAccordion: React.FC<TaskAccordionProps> = ({ task, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdating(true);
        try {
            await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
            onUpdate();
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden transition-all duration-300">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h4 className="font-bold text-primary-text dark:text-white text-base leading-tight">{task.title}</h4>
                    {task.due_date && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-secondary-text dark:text-gray-400">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                        {formatStatus(task.status)}
                    </span>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </div>
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4">
                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg leading-relaxed">
                                {task.description}
                            </p>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Status</label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'in_progress', 'completed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={updating || task.status === status}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border
                                            ${task.status === status
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }
                                            ${updating ? 'opacity-50 cursor-wait' : ''}
                                        `}
                                    >
                                        {formatStatus(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskAccordion;
