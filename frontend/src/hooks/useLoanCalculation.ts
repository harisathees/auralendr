import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import toast from 'react-hot-toast';

interface LoanData {
    loan_no: string;
    amount: number;
    date: string;
    interest_rate: number;
    validity_months: number;
    status: string;
    interest_taken: boolean;
    jewels: any[]; // Include jewels array
    customer: any;
    customer_loan_track: any;
}

export const useLoanCalculation = (loanId: string | null) => {
    const [loanData, setLoanData] = useState<LoanData | null>(null);
    const [metalRates, setMetalRates] = useState<any[]>([]); // Store metal rates
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await api.get('/metal-rates');
                if (Array.isArray(res.data)) {
                    setMetalRates(res.data);
                }
            } catch (e) {
                console.error("Error fetching metal rates", e);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (!loanId) return;

        const fetchLoanData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/pledges/${loanId}`);

                const responseData = response.data;
                // Check if data is wrapped in 'data' property (Laravel Resource) or returned directly
                const pledge = (responseData && responseData.data) ? responseData.data : responseData;
                const loan = pledge?.loan || {};

                // If no loan data found, throw specific error
                if (!pledge || !loan.loan_no) {
                    console.error("Invalid Pledge/Loan Data Response:", response.data);
                    throw new Error("Invalid API response: Loan data not found in pledge object");
                }

                setLoanData({
                    loan_no: loan.loan_no,
                    amount: Number(loan.amount),
                    date: loan.date,
                    interest_rate: Number(loan.interest_percentage), // Map interest_percentage to interest_rate
                    validity_months: Number(loan.validity_months),
                    status: pledge.status,
                    interest_taken: false, // Default or fetch if available
                    jewels: pledge.jewels || [],
                    customer: pledge.customer,
                    customer_loan_track: loan.customer_loan_track,
                });
            } catch (err: any) {
                console.error("Error fetching loan data:", err);
                setError(err.response?.data?.message || 'Failed to fetch loan data');
            } finally {
                setLoading(false);
            }
        };

        fetchLoanData();
    }, [loanId]);

    const saveCalculationAndCloseLoan = async (toDate: string, reductionAmount: number, method: string, calculationResult: any, paymentSourceId: number, amountPaid: number) => {
        if (!loanId) return false;
        setSaving(true);
        try {
            await api.post(`/pledges/${loanId}/close`, {
                closed_date: toDate,
                reduction_amount: reductionAmount,
                calculation_method: method,
                metal_rate: calculationResult.metal_rate,
                payment_source_id: paymentSourceId,
                amount_paid: amountPaid,
                ...calculationResult
            });
            toast.success('Pledge closed successfully');
            return true;
        } catch (err: any) {
            console.error("Error closing pledge:", err);
            toast.error(err.response?.data?.message || 'Failed to close pledge');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { loanData, metalRates, loading, error, saving, saveCalculationAndCloseLoan };
};
