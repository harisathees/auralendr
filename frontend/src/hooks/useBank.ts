import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';

export interface Bank {
    id: string;
    name: string;
    code?: string;
    branch?: string;
    default_interest?: number;
    validity_months?: number;
    post_validity_interest?: number;
    payment_method?: string;
}

export const useBanks = () => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBanks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await http.get('/banks');
            setBanks(res.data || []);
        } catch (err: any) {
            console.error("Failed to fetch banks", err);
            setError(err.response?.data?.message || "Failed to fetch banks");
        } finally {
            setLoading(false);
        }
    }, []);

    const createBank = async (data: Partial<Bank>) => {
        setLoading(true);
        try {
            const res = await http.post('/banks', data);
            setBanks(prev => [...prev, res.data]);
            return res.data;
        } catch (err: any) {
            console.error("Failed to create bank", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    return {
        banks,
        loading,
        error,
        createBank,
        fetchBanks
    };
};
