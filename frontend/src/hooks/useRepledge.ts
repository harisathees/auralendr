import { useState, useEffect, useCallback } from 'react';
import http from '../api/http';

export interface RepledgeEntry {
    id: string;
    loan_id: string | null;
    loan_no: string;
    re_no: string;
    net_weight: number;
    gross_weight: number;
    stone_weight: number;
    amount: number;
    processing_fee: number;
    bank_id?: string | null; // Deprecated, use repledge_source_id
    repledge_source_id: string | null;
    interest_percent: number;
    validity_period: number;
    after_interest_percent: number;
    payment_method: string | null;
    start_date: string | null;
    end_date: string | null;
    due_date: string | null;
    status: string;
    created_at: string;
}

export interface LoanDetails {
    loan: {
        id: string;
        loan_no: string;
        amount: number;
        // Add other fields as expected from backend
    };
    totals: {
        net_weight: number;
        gross_weight: number; // Assuming backend provides this
        stone_weight: number;
    };
}

export interface LoanSuggestion {
    loan_no: string;
    amount: number;
    status: string;
}

export const useRepledge = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [repledgeEntries, setRepledgeEntries] = useState<RepledgeEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch Repledge Entries
    const fetchRepledgeEntries = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await http.get(`/repledges?page=${page}`);
            setRepledgeEntries(res.data.data);
            setTotalPages(res.data.last_page);
            setCurrentPage(res.data.current_page);
        } catch (err: any) {
            console.error("Failed to fetch repledge entries", err);
            // setError(err.response?.data?.message || "Failed to fetch entries");
            // Don't set global error for background fetch
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Loan Details by Loan No
    const fetchLoanDetails = async (loanNo: string): Promise<LoanDetails | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await http.get(`/loans/${loanNo}`);
            // Assuming existing backend structure, might need adjustment
            // Based on typical Laravel response for detail
            return res.data;
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
            const res = await http.post('/repledges', data);
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
            await http.delete(`/repledges/${id}`);
            setRepledgeEntries(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            console.error("Failed to delete entry", err);
            throw err;
        }
    };

    // Search Loan for Repledge (Auto-fetch)
    const searchLoanSuggestions = async (loanNo: string) => {
        try {
            const res = await http.get(`/repledges/search-loan?query=${loanNo}`);
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
