
// Import types from your types folder
import { JobRaw, JobProcessed, UserPreferences } from '@/types';

// Supabase Database type helpers
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      jobs_raw: {
        Row: JobRaw;
        Insert: Omit<JobRaw, 'id' | 'fetched_at'>;
        Update: Partial<JobRaw>;
      };
      jobs_processed: {
        Row: JobProcessed;
        Insert: Omit<JobProcessed, 'processed_at'>;
        Update: Partial<JobProcessed>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'updated_at'>;
        Update: Partial<UserPreferences>;
      };
    };
  };
}