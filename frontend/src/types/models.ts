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
