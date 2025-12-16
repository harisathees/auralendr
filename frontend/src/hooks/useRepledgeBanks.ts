import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';
import type { RepledgeBank } from '../types/models';

export const useRepledgeBanks = () => {
    const [banks, setBanks] = useState<RepledgeBank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBanks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await http.get('/repledge-banks');
            setBanks(res.data || []);
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

    return {
        banks,
        loading,
        error,
        fetchBanks
    };
};
