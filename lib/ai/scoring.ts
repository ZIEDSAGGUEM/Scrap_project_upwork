import { supabaseAdmin } from '@/lib/supabase/admin';
import type { JobRaw } from '@/types';

export interface ScoreBreakdown {
  embedding_similarity: number;
  budget_score: number;
  client_score: number;
  skills_score: number;
  relevance_score: number;
}

export async function calculateJobScore(
  job: JobRaw,
  embeddingSimilarity: number
): Promise<ScoreBreakdown> {
  // Get user preferences
  const { data: prefs, error } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .single();

  if (error || !prefs) {
    throw new Error('User preferences not found');
  }

  // Calculate individual scores
  const budgetScore = calculateBudgetScore(job, prefs.min_budget);
  const clientScore = calculateClientScore(job);
  const skillsScore = calculateSkillsScore(job.skills || [], prefs.skills);

  // Hybrid formula: 60% embedding, 20% budget, 10% client, 10% skills
  const relevance_score =
    (0.60 * embeddingSimilarity) +
    (0.20 * budgetScore) +
    (0.10 * clientScore) +
    (0.10 * skillsScore);

  return {
    embedding_similarity: Math.round(embeddingSimilarity * 100) / 100,
    budget_score: Math.round(budgetScore * 100) / 100,
    client_score: Math.round(clientScore * 100) / 100,
    skills_score: Math.round(skillsScore * 100) / 100,
    relevance_score: Math.round(relevance_score * 100) / 100,
  };
}

function calculateBudgetScore(job: JobRaw, minBudget: number): number {
  if (!job.budget) return 50; // Default if no budget

  let jobBudget = 0;

  if (job.budget.type === 'fixed' && job.budget.amount) {
    jobBudget = job.budget.amount;
  } else if (job.budget.type === 'hourly' && job.budget.hourly_max) {
    // Estimate monthly: max hourly rate * 160 hours
    jobBudget = job.budget.hourly_max * 160;
  }

  if (jobBudget === 0) return 50;

  // Scoring logic
  if (jobBudget >= minBudget * 2) return 100;     // 2x minimum = perfect
  if (jobBudget >= minBudget * 1.5) return 90;    // 1.5x minimum = excellent
  if (jobBudget >= minBudget) return 80;          // Meets minimum = good
  if (jobBudget >= minBudget * 0.7) return 60;    // 70% of minimum = ok
  if (jobBudget >= minBudget * 0.5) return 40;    // 50% of minimum = low
  return 20; // Below 50% = very low
}

function calculateClientScore(job: JobRaw): number {
  let score = 50; // Base score

  // Client spend bonus (max +30)
  if (job.client_spend) {
    if (job.client_spend >= 100000) score += 30;
    else if (job.client_spend >= 50000) score += 25;
    else if (job.client_spend >= 10000) score += 20;
    else if (job.client_spend >= 5000) score += 15;
    else if (job.client_spend >= 1000) score += 10;
  }

  // Hire rate bonus (max +20)
  if (job.client_hire_rate) {
    if (job.client_hire_rate >= 90) score += 20;
    else if (job.client_hire_rate >= 80) score += 15;
    else if (job.client_hire_rate >= 70) score += 10;
    else if (job.client_hire_rate >= 50) score += 5;
  }

  // Payment verified bonus
  if (job.client?.verified) {
    score += 10;
  }

  return Math.min(100, score);
}

function calculateSkillsScore(jobSkills: string[], userSkills: string[]): number {
  if (!jobSkills.length || !userSkills.length) return 50;

  // Normalize skills for comparison (lowercase)
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

  // Count matches
  const matches = normalizedJobSkills.filter(jobSkill =>
    normalizedUserSkills.some(userSkill =>
      jobSkill.includes(userSkill) || userSkill.includes(jobSkill)
    )
  );

  // Calculate match percentage
  const matchPercentage = (matches.length / jobSkills.length) * 100;

  // Boost score if match percentage is high
  return Math.min(100, matchPercentage * 1.2);
}