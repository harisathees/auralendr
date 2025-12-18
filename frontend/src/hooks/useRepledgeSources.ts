import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';
import type { RepledgeSource } from "../types/models";

export const useRepledgeSources = () => {
    const [sources, setSources] = useState<RepledgeSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBanks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await http.get('/repledge-sources');
            setSources(response.data.data || response.data);
        } catch (err: any) {
            console.error("Failed to fetch repledge banks", err);
            setError(err.response?.data?.message || "Failed to fetch banks");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    return { sources, loading, error, refetch: fetchBanks };
};
