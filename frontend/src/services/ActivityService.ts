import api from '../api/apiClient';
import type { Activity, ActivityFilters } from '../types/Activity';

const getActivities = async (filters: ActivityFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.action) params.append('action', filters.action);
    if (filters.date) params.append('date', filters.date);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    params.append('per_page', (filters.per_page || 10).toString());

    const response = await api.get<{ data: Activity[]; current_page: number; last_page: number; total: number }>(`/activities?${params.toString()}`);
    return response.data;
};

export const ActivityService = {
    getActivities,
};
