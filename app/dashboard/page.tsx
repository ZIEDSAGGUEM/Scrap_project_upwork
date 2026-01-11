/**
 * Dashboard Page
 * Modern job feed with beautiful design
 */

import { fetchDashboardJobs, getJobStats } from '@/lib/supabase/queries';
import { DashboardClient } from '@/components/DashboardClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    // Fetch jobs and stats
    const [jobs, stats] = await Promise.all([
      fetchDashboardJobs(),
      getJobStats(),
    ]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" suppressHydrationWarning>
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
          
          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {/* Settings Button - Top Right */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>

            <div className="text-center mb-6 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                🎯 Upwork Job Hunter
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto px-4">
                AI-Powered Job Matching • Find Your Perfect Freelance Opportunities
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {/* Total Jobs Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 border border-white/20">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stats.totalJobs}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Jobs</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Available opportunities</p>
              </div>

              {/* High Score Jobs Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 border border-white/20">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {stats.highScoreJobs}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Perfect Matches</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Score 70% or higher</p>
              </div>

              {/* Avg Relevance Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 border border-white/20 sm:col-span-1 col-span-full">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.avgRelevance}%
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Avg. Match Score</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Overall relevance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <DashboardClient initialJobs={jobs} stats={stats} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Oops!</h1>
          <p className="text-gray-600 mb-6">Something went wrong loading the dashboard</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

