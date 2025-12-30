import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import type { RepledgeSource } from '../types/models';

export const useRepledgeSource = () => {
    const [sources, setSources] = useState<RepledgeSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSources = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/repledge-sources');
            setSources(res.data || []);
        } catch (err: any) {
            console.error("Failed to fetch sources", err);
            setError(err.response?.data?.message || "Failed to fetch sources");
        } finally {
            setLoading(false);
        }
    }, []);

    const createSource = async (data: Partial<RepledgeSource>) => {
        setLoading(true);
        try {
            const res = await api.post('/api/repledge-sources', data);
            setSources(prev => [...prev, res.data]);
            return res.data;
        } catch (err: any) {
            console.error("Failed to create source", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, [fetchSources]);

    return {
        sources,
        loading,
        error,
        createSource,
        fetchSources
    };
};
