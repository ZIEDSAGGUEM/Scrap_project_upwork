/**
 * Job Details Page
 * Full job information with score breakdown
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchJobById } from '@/lib/supabase/queries';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import {
  formatDate,
  formatBudget,
  formatClientSpend,
  getExperienceLevelColor,
} from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const job = await fetchJobById(resolvedParams.id);

    if (!job || !job.jobs_raw) {
      notFound();
    }

    const { jobs_raw } = job;
    const allSkills = [
      ...(jobs_raw.skills || []),
      ...(job.extracted_skills || []),
    ];
    const uniqueSkills = Array.from(new Set(allSkills));

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>

          {/* Job Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobs_raw.title}</h1>
                <p className="text-gray-600">Posted {formatDate(jobs_raw.posted_at)}</p>
              </div>
              <a
                href={jobs_raw.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                View on Upwork
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {jobs_raw.budget && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
                  <span className="font-medium text-blue-900">💰 {formatBudget(jobs_raw.budget)}</span>
                </div>
              )}
              {jobs_raw.experience_level && (
                <div
                  className={`px-3 py-2 rounded-md font-medium ${getExperienceLevelColor(
                    jobs_raw.experience_level
                  )}`}
                >
                  {jobs_raw.experience_level}
                </div>
              )}
              {jobs_raw.job_type && (
                <div className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md font-medium">
                  {jobs_raw.job_type === 'hourly' ? '⏱️ Hourly' : '📦 Fixed Price'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{jobs_raw.description}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Required Skills ({uniqueSkills.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {uniqueSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Client</h2>
                <div className="space-y-3">
                  {jobs_raw.client_country && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="font-medium">Location:</span>
                      <span>{jobs_raw.client_country}</span>
                    </div>
                  )}
                  {jobs_raw.client_spend !== null && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">Total Spent:</span>
                      <span>{formatClientSpend(jobs_raw.client_spend)}</span>
                    </div>
                  )}
                  {jobs_raw.client?.verified && (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Payment Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ScoreBreakdown
                relevanceScore={job.relevance_score}
                embeddingSimilarity={job.embedding_similarity}
                budgetScore={job.budget_score}
                clientScore={job.client_score}
                skillsScore={job.skills_score}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Job details error:', error);
    notFound();
  }
}

