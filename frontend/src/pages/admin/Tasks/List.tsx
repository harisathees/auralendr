import React, { useEffect, useState } from 'react';
import http from '../../../api/http';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../components/Shared/Toast';
import ConfirmationModal from '../../../components/Shared/ConfirmationModal';
import type { Task } from '../../../types/models';
import TaskForm from './TaskForm';

const List: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // UI state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false,
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; taskId: number | null }>({
        isOpen: false,
        taskId: null,
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await http.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            showToast('Failed to fetch tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAdd = () => {
        setEditingTask(null);
        setShowModal(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ isOpen: true, taskId: id });
    };

    const confirmDelete = async () => {
        if (deleteModal.taskId) {
            try {
                await http.delete(`/tasks/${deleteModal.taskId}`);
                showToast('Task deleted successfully');
                fetchTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
                showToast('Failed to delete task', 'error');
            } finally {
                setDeleteModal({ isOpen: false, taskId: null });
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        showToast(editingTask ? 'Task updated successfully' : 'Task created successfully');
        fetchTasks();
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
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmLabel="Delete"
                isDangerous={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, taskId: null })}
            />

            {/* Header */}
            <header className="flex-none flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 shadow-sm border-b border-border-green/50 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary-text dark:text-white">arrow_back</span>
                </button>
                <h2 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Tasks</h2>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 p-4 pb-24">

                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary-text dark:text-white">All Tasks</h3>
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create Task
                    </button>
                </div>

                {/* List Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        <p className="text-sm font-medium text-gray-500">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
                        <span className="material-symbols-outlined text-5xl text-gray-300">checklist</span>
                        <p className="text-gray-500 font-medium">No tasks found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-surface dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-border-green/30 flex flex-col gap-3 group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-primary-text dark:text-white text-lg">{task.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description || 'No description'}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide border ${getStatusColor(task.status)}`}>
                                        {formatStatus(task.status)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-[18px]">person</span>
                                            <span className="font-medium">{task.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                        {task.due_date && (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <span className="material-symbols-outlined text-[18px]">event</span>
                                                <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(task)}
                                            className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(task.id)}
                                            className="h-8 w-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <TaskForm
                    task={editingTask}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default List;
