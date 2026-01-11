/**
 * Supabase Query Functions
 * Reusable database queries for the dashboard
 */

import { supabaseAdmin } from './admin';

export interface JobWithDetails {
  id: string;
  relevance_score: number;
  budget_score: number;
  client_score: number;
  skills_score: number;
  embedding_similarity: number;
  extracted_skills: string[];
  processed_at: string;
  jobs_raw: {
    upwork_job_id: string;
    url: string;
    title: string;
    description: string;
    budget: any;
    job_type: string | null;
    experience_level: string | null;
    skills: string[];
    client: any;
    client_country: string | null;
    client_spend: number | null;
    client_hire_rate: number | null;
    posted_at: string;
  };
}

/**
 * Fetch all processed jobs for the dashboard
 */
export async function fetchDashboardJobs(filters?: {
  minScore?: number;
  maxScore?: number;
  jobType?: string;
  experienceLevel?: string;
  sortBy?: 'relevance' | 'date' | 'budget' | 'client';
}) {
  let query = supabaseAdmin
    .from('jobs_processed')
    .select(`
      id,
      relevance_score,
      budget_score,
      client_score,
      skills_score,
      embedding_similarity,
      extracted_skills,
      processed_at,
      jobs_raw!inner (
        upwork_job_id,
        url,
        title,
        description,
        budget,
        job_type,
        experience_level,
        skills,
        client,
        client_country,
        client_spend,
        client_hire_rate,
        posted_at
      )
    `);

  // Apply filters
  if (filters?.minScore !== undefined) {
    query = query.gte('relevance_score', filters.minScore);
  }
  if (filters?.maxScore !== undefined) {
    query = query.lte('relevance_score', filters.maxScore);
  }
  if (filters?.jobType) {
    query = query.eq('jobs_raw.job_type', filters.jobType);
  }
  if (filters?.experienceLevel) {
    query = query.eq('jobs_raw.experience_level', filters.experienceLevel);
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'relevance':
      query = query.order('relevance_score', { ascending: false });
      break;
    case 'date':
      query = query.order('processed_at', { ascending: false });
      break;
    case 'budget':
      query = query.order('budget_score', { ascending: false });
      break;
    case 'client':
      query = query.order('client_score', { ascending: false });
      break;
    default:
      query = query.order('relevance_score', { ascending: false });
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching dashboard jobs:', error);
    throw error;
  }

  return (data || []) as unknown as JobWithDetails[];
}

/**
 * Fetch a single job by ID with full details
 */
export async function fetchJobById(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from('jobs_processed')
    .select(`
      *,
      jobs_raw (*)
    `)
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch user preferences
 */
export async function fetchUserPreferences() {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }

  return data;
}

/**
 * Get job statistics
 */
export async function getJobStats() {
  const { count: totalJobs } = await supabaseAdmin
    .from('jobs_processed')
    .select('*', { count: 'exact', head: true });

  const { count: highScoreJobs } = await supabaseAdmin
    .from('jobs_processed')
    .select('*', { count: 'exact', head: true })
    .gte('relevance_score', 70);

  const { data: avgScores } = await supabaseAdmin
    .from('jobs_processed')
    .select('relevance_score, budget_score, client_score, skills_score');

  const avgRelevance = (avgScores && avgScores.length > 0)
    ? avgScores.reduce((sum, job) => sum + job.relevance_score, 0) / avgScores.length
    : 0;

  return {
    totalJobs: totalJobs || 0,
    highScoreJobs: highScoreJobs || 0,
    avgRelevance: Math.round(avgRelevance || 0),
  };
}

