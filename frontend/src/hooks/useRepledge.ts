import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';

import type { Repledge as RepledgeEntry, LoanSuggestion } from '../types/models';

export const useRepledge = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [repledgeEntries, setRepledgeEntries] = useState<RepledgeEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch Repledge Entries
    const fetchRepledgeEntries = useCallback(async (page = 1, search = "", perPage = 10) => {
        setLoading(true);
        try {
            const res = await api.get(`/repledges`, { params: { page, search, per_page: perPage } });
            setRepledgeEntries(res.data.data);
            setTotalPages(res.data.last_page);
            setCurrentPage(res.data.current_page);
        } catch (err: any) {
            console.error("Failed to fetch repledge entries", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Loan Details by Loan No
    const fetchLoanDetails = async (loanNo: string): Promise<any | null> => {
        setLoading(true);
        setError(null);
        try {
            // Using search endpoint as it contains specific validations (like already repledged) and aggregated data
            const res = await api.get(`/repledge-loans/search?query=${loanNo}`);
            return {
                loan: res.data,
                totals: {
                    gross_weight: res.data.gross_weight,
                    net_weight: res.data.net_weight,
                    stone_weight: res.data.stone_weight
                }
            };
        } catch (err: any) {
            console.error("Failed to fetch loan details", err);
            setError(err.response?.data?.message || "Loan not found");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Save Repledge Entry
    const saveRepledgeEntry = async (data: Partial<RepledgeEntry>) => {
        try {
            const res = await api.post('/repledges', data);
            setRepledgeEntries(prev => [res.data, ...prev]);
            return res.data;
        } catch (err: any) {
            console.error("Failed to save repledge entry", err);
            throw err; // Let component handle error toast
        }
    };

    // Delete Repledge Entry
    const deleteRepledgeEntry = async (id: string) => {
        try {
            await api.delete(`/repledges/${id}`);
            setRepledgeEntries(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            console.error("Failed to delete entry", err);
            throw err;
        }
    };

    // Search Loan for Repledge (Auto-fetch)
    const searchLoanSuggestions = async (loanNo: string): Promise<LoanSuggestion[] | null> => {
        try {
            const res = await api.get(`/repledge-loans/search?query=${loanNo}`);
            return res.data;
        } catch (err: any) {
            console.error("Search failed", err);
            // Return null or rethrow? 
            // If 404, valid. If 500, error.
            if (err.response && err.response.status === 404) return null;
            throw err;
        }
    };

    useEffect(() => {
        // fetchRepledgeEntries(); // User might only want to fetch explicitly in List page
    }, []);

    return {
        loading,
        error,
        repledgeEntries,
        currentPage,
        totalPages,
        setCurrentPage,
        fetchLoanDetails,
        saveRepledgeEntry,
        deleteRepledgeEntry,
        fetchRepledgeEntries,
        searchLoanSuggestions
    };
};
