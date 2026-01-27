import type { User } from "./models";

export interface Activity {
    id: number;
    user_id: number;
    user?: User;
    action: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
}

export interface ActivityFilters {
    user_id?: string;
    action?: string;
    date?: string;
    search?: string;
    page?: number;
    per_page?: number;
}
