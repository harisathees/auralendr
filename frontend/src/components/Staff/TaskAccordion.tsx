import React, { useState } from 'react';
import { ChevronDown, Calendar } from "lucide-react";
import type { Task } from '../../types/models';
import api from '../../api/apiClient';

interface TaskAccordionProps {
    task: Task;
    onUpdate: () => void;
}

const TaskAccordion: React.FC<TaskAccordionProps> = ({ task, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Status options for staff
    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    ];

    const handleStatusUpdate = async (newStatus: string) => {
        if (updating) return;
        setUpdating(true);
        try {
            await api.patch(`/api/tasks/${task.id}/status`, { status: newStatus });
            onUpdate(); // Refund list
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setUpdating(false);
        }
    };

    const currentStatus = statusOptions.find(opt => opt.value === task.status) || statusOptions[0];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            {/* Header */}
            <div
                className="p-4 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}></div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{task.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created by {task.creator?.name || 'Admin'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.color} whitespace-nowrap`}>
                        {currentStatus.label}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="pl-5 border-l-2 border-gray-100 dark:border-gray-700 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {task.description || 'No description provided.'}
                        </p>

                        {task.due_date && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                        )}

                        <div className="pt-2 flex flex-wrap gap-2">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(option.value);
                                    }}
                                    disabled={updating || task.status === option.value}
                                    className={`
                                text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
                                ${task.status === option.value
                                            ? 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-primary dark:text-gray-300'
                                        }
                            `}
                                >
                                    {updating && task.status === option.value ? 'Updating...' : `Mark ${option.label}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskAccordion;
