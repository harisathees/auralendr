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
    role: 'admin' | 'staff';
    branch_id: number | null;
    branch?: Branch;
    created_at?: string;
    updated_at?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    assigned_to: number;
    created_by: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date: string | null;
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

export interface RepledgeBank {
    id: number;
    name: string;
    code: string | null;
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
    id: number;
    loan_no: string;
    re_no: string;
    bank_id: number;
    amount: string;
    processing_fee: string;
    interest_percent: number;
    validity_period: number;
    after_interest_percent: number;
    start_date?: string;
    end_date?: string;
    due_date?: string;
    status: 'active' | 'closed';
    bank?: RepledgeBank;
    created_at?: string;
    updated_at?: string;
}
