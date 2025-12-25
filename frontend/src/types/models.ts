export interface Branch {
    id: number;
    branch_name: string;
    location: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'developer' | 'superadmin' | string;
    branch_id: number | null;
    branch?: Branch;
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    assigned_to: number | null;
    created_by: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date: string | null;
    branch_id?: number | null;
    created_at: string;
    updated_at: string;
    assignee?: User;
    creator?: User;
}

export interface MoneySource {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'wallet';
    balance: string;
    description: string | null;
    is_outbound: boolean;
    is_inbound: boolean;
    is_active: boolean;
    show_balance: boolean;
    created_at?: string;
    updated_at?: string;
    branches?: any[]; // Simplified for now
}

export interface MoneySourceType {
    id: number;
    name: string;
    value: string;
    icon: string | null;
}

export interface RepledgeSource {
    id: number;
    name: string;
    description: string | null;
    branch: string | null; // legacy field name in DB for branch name text
    default_interest: number;
    validity_months: number;
    post_validity_interest: number;
    payment_method: string | null;
    created_at?: string;
    updated_at?: string;
    branches?: Branch[];
}

export interface Repledge {
    id: number | string; // Unified to allow string IDs if used in frontend logic
    loan_id?: string | number | null;
    loan_no: string;
    re_no: string;
    repledge_source_id: number | string | null;
    net_weight?: number;
    gross_weight?: number;
    stone_weight?: number;
    amount: string | number;
    processing_fee: string | number;
    interest_percent: number;
    validity_period: number;
    after_interest_percent: number;
    start_date?: string | null;
    end_date?: string | null;
    due_date?: string | null;
    status: 'active' | 'closed' | string;
    source?: RepledgeSource | { id: number; name: string } | null;
    payment_method?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface LoanDetails {
    loan: {
        id: string;
        loan_no: string;
        amount: number;
        [key: string]: any;
    };
    totals: {
        net_weight: number;
        gross_weight: number;
        stone_weight: number;
    };
}

export interface LoanSuggestion {
    loan_no: string;
    amount: number;
    status: string;
}

export interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: string;
    date: string;
    description: string;
    category: string;
    money_source: {
        name: string;
        type: string;
    };
    created_at: string;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

export interface MetalRate {
    rate: string;
    updated_at: string;
}

export interface JewelType {
    id: number;
    name: string;
    description?: string;
    metal_rate?: MetalRate;
}

export interface ProcessingFee {
    id: number;
    jewel_type_id: number;
    branch_id: number;
    percentage: string;
    max_amount: string;
}

export interface RepledgeItem {
    id?: string;
    loanId: string;
    loanNo: string;
    reNo: string;
    netWeight: number;
    grossWeight: number;
    stoneWeight: number;
    amount: number;
    processingFee: number;
    interestPercent: number;
    validityPeriod: number;
    afterInterestPercent: number;
    paymentMethod: string;
    repledgeSourceId: string;
    isBankDetailsOpen?: boolean;
    startDate: string;
    endDate: string;
}

export interface Pledge {
    id: number;
    customer: Customer;
    jewels: Jewel[];
    loan: Loan;
    media: any[];
    closure?: {
        balance_amount?: string | number;
        [key: string]: any;
    };
    status?: string; // Inferred from usage in PledgeList
}

export interface Customer {
    id: number;
    name: string;
    mobile_no: string;
    email?: string | null;
    whatsapp_no?: string | null;
    address?: string | null;
    sub_address?: string | null;
    city?: string | null;
    place?: string | null;
    id_proof_type?: string | null;
    id_proof_number?: string | null;
    document_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Jewel {
    id?: number;
    jewel_type: string;
    quality: string;
    description: string;
    pieces: number;
    weight: string | number;
    stone_weight: string | number;
    net_weight: string | number;
    faults?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Loan {
    id?: number;
    loan_no: string;
    date: string;
    amount: string | number;
    interest_percentage: string;
    validity_months: string | number;
    due_date: string;
    payment_method: string;
    processing_fee: string | number;
    estimated_amount: string | number;
    include_processing_fee?: boolean;
    interest_taken?: boolean;
    amount_to_be_given: string | number;
    metal_rate: string | number;
    status?: string;
}

export interface ConfigItem {
    id: number;
    name: string;
    description?: string;
    [key: string]: any;
}

export interface TransactionCategory {
    id: number;
    name: string;
    type?: string;
    is_credit?: boolean;
    is_debit?: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
