import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Clock, Check } from "lucide-react";
import api from "../../../api/apiClient";
import { formatDistanceToNow } from "date-fns";

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.read_at);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/10';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/10';
            case 'alert': return 'bg-red-50 dark:bg-red-900/10';
            default: return 'bg-blue-50 dark:bg-blue-900/10';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display">
            {/* Header */}
            <header className="flex-none flex items-center justify-between bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Notifications
                            {notifications.filter(n => !n.read_at).length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {notifications.filter(n => !n.read_at).length} New
                                </span>
                            )}
                        </h1>
                    </div>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                    Mark all as read
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setActiveTab('unread')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unread'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                >
                    Unread
                </button>
            </div>

            {/* Notifications List */}
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Bell className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No notifications yet</p>
                            <p className="text-sm">We'll let you know when something arrives.</p>
                        </div>
                    ) : (
                        filteredNotifications.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 rounded-xl border transition-colors relative group cursor-pointer ${item.read_at
                                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                    : 'bg-primary/5 border-primary/10'
                                    }`}
                                onClick={() => {
                                    if (item.data.link) {
                                        navigate(item.data.link);
                                        markAsRead(item.id);
                                    }
                                }}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBgColor(item.data.type || 'info')}`}>
                                        {getIcon(item.data.type || 'info')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className={`font-semibold text-sm ${item.read_at ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                                                {item.data.title || "Notification"}
                                            </h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {item.data.message || ""}
                                        </p>
                                    </div>
                                </div>
                                {!item.read_at && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(item.id);
                                        }}
                                        className="absolute top-4 right-4 p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Mark as read"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
