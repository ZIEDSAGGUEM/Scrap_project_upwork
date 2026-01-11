/**
 * JobCard Component
 * Modern job card with beautiful design
 */

import Link from 'next/link';
import { formatDate, formatBudget, getScoreColor, truncateText, formatClientSpend, getExperienceLevelColor } from '@/lib/utils/formatting';
import type { JobWithDetails } from '@/lib/supabase/queries';

interface JobCardProps {
  job: JobWithDetails;
}

export function JobCard({ job }: JobCardProps) {
  const { jobs_raw } = job;
  const score = Math.round(job.relevance_score);
  const scoreColor = getScoreColor(score);

  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="group relative bg-white/90 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 md:p-7 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        
        {/* Score Badge - Floating */}
        <div className="absolute -top-2 -right-2 transform group-hover:scale-110 transition-transform duration-300 z-10">
          <div className={`${scoreColor} px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-2xl shadow-lg text-xs sm:text-sm font-black`}>
            ⭐ {score}%
          </div>
        </div>

        {/* Experience Level Badge - Mobile Friendly */}
        {jobs_raw.experience_level && (
          <div className="mb-2 sm:absolute sm:top-4 sm:left-4 sm:mb-0">
            <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-md ${getExperienceLevelColor(jobs_raw.experience_level)}`}>
              {jobs_raw.experience_level}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 pr-16 sm:pr-20 leading-tight mt-0 sm:mt-8">
          {jobs_raw.title}
        </h3>

        {/* Description Preview */}
        <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
          {truncateText(jobs_raw.description, 150)}
        </p>

        {/* Skills Tags */}
        {jobs_raw.skills && jobs_raw.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
            {jobs_raw.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200/50 hover:border-blue-400 transition-colors"
              >
                {skill}
              </span>
            ))}
            {jobs_raw.skills.length > 6 && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                +{jobs_raw.skills.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* Footer Info Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-5 border-t-2 border-gray-100">
          {/* Budget */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Budget</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{formatBudget(jobs_raw.budget)}</p>
            </div>
          </div>

          {/* Client Location */}
          {jobs_raw.client_country && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{jobs_raw.client_country}</p>
              </div>
            </div>
          )}

          {/* Client Spend */}
          {jobs_raw.client_spend && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Client</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{formatClientSpend(jobs_raw.client_spend)}</p>
              </div>
            </div>
          )}

          {/* Posted Time */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Posted</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{formatDate(jobs_raw.posted_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

