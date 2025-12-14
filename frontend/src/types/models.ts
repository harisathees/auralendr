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
