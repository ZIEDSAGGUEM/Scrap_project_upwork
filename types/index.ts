// This file will contain all shared TypeScript interfaces

export interface JobRaw {
    id: string;
    upwork_job_id: string;
    url: string;
    title: string | null;
    description: string | null;
    budget: Budget | null;
    job_type: string | null;
    experience_level: string | null;
    client: ClientInfo | null;
    client_country: string | null;
    client_spend: number | null;
    client_hire_rate: number | null;
    skills: string[];
    connects_required: number | null;
    posted_at: string | null;
    fetched_at: string;
  }
  
  export interface JobProcessed {
    id: string;
    clean_text: string | null;
    extracted_skills: string[];
    metadata: Record<string, any> | null;
    embedding: number[];
    embedding_similarity: number | null;
    budget_score: number | null;
    client_score: number | null;
    skills_score: number | null;
    relevance_score: number;
    processed_at: string;
  }
  
  export interface UserPreferences {
    id: string;
    skills: string[];
    min_budget: number;
    preferred_countries: string[];
    updated_at: string;
  }
  
  export interface Budget {
    type: 'fixed' | 'hourly';
    amount?: number;
    hourly_min?: number;
    hourly_max?: number;
  }
  
  export interface ClientInfo {
    name?: string;
    country?: string;
    total_spent?: number;
    hire_rate?: number;
    jobs_posted?: number;
    verified?: boolean;
  }
  
  export interface ScoreBreakdown {
    embedding_similarity: number;
    budget_score: number;
    client_score: number;
    skills_score: number;
    final_score: number;
  }