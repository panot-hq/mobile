// Database types generated from your Supabase schema

export interface Contact {
  id: string;
  owner_id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  department?: string;
  address?: string;
  birthday?: string; // ISO date string
  notes?: string;
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  communication_channels?: string;
}

export interface ContactInsert {
  id?: string;
  owner_id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  department?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  communication_channels?: string;
}

export interface ContactUpdate {
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  department?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  communication_channels?: string;
  updated_at?: string;
}

export interface Interaction {
  id: string;
  raw_content: string;
  key_concepts: string;
  created_at: string; // ISO timestamp
  contact_id?: string;
  owner_id?: string;
}

export interface InteractionInsert {
  raw_content: string;
  key_concepts: string;
  contact_id?: string;
  owner_id?: string;
}

export interface InteractionUpdate {
  raw_content?: string;
  key_concepts?: string;
  contact_id?: string;
  owner_id?: string;
}

export interface Profile {
  user_id: string;
  onboarding_done: boolean;
  created_at?: string; // ISO timestamp
}

export interface ProfileInsert {
  user_id: string;
  onboarding_done?: boolean;
}

export interface ProfileUpdate {
  onboarding_done?: boolean;
}

// Common response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResponse<T> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}
