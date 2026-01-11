'use client';

/**
 * DashboardClient Component
 * Modern interactive dashboard with filters + realtime updates
 */

import { useState, useMemo, useEffect } from 'react';
import { JobCard } from './JobCard';
import { FilterSidebar } from './FilterSidebar';
import type { JobWithDetails } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';

interface DashboardClientProps {
  initialJobs: JobWithDetails[];
  stats: {
    totalJobs: number;
    highScoreJobs: number;
    avgRelevance: number;
  };
}

export function DashboardClient({ initialJobs, stats }: DashboardClientProps) {
  // Jobs state (starts with initial jobs, updates with realtime)
  const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs);
  
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    jobType: '',
    experienceLevel: '',
  });
  const [showFilters, setShowFilters] = useState(true);

  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'budget' | 'client'>('relevance');

  // 🔴 REALTIME SUBSCRIPTION - Listen for new jobs
  useEffect(() => {
    console.log('🔴 Setting up realtime subscription...');
    
    const channel = supabase
      .channel('jobs_realtime_dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs_processed'
        },
        (payload) => {
          console.log('🆕 New job detected via realtime!', payload.new);
          
          // Add new job to the list (at the top)
          setJobs((prevJobs) => {
            // Check if job already exists (prevent duplicates)
            const exists = prevJobs.some((job) => job.id === payload.new.id);
            if (exists) return prevJobs;
            
            // Add new job at the beginning
            return [payload.new as JobWithDetails, ...prevJobs];
          });
          
          // Optional: Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🆕 New Job Available!', {
              body: `New job added: ${(payload.new as any).jobs_raw?.title || 'Untitled'}`,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔴 Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  // Request notification permission (optional)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let jobsList = [...jobs];

    // Apply filters
    jobsList = jobsList.filter((job) => {
      // Score filter
      if (job.relevance_score < filters.minScore || job.relevance_score > filters.maxScore) {
        return false;
      }

      // Job type filter
      if (filters.jobType && job.jobs_raw.job_type !== filters.jobType) {
        return false;
      }

      // Experience level filter
      if (filters.experienceLevel && job.jobs_raw.experience_level !== filters.experienceLevel) {
        return false;
      }

      return true;
    });

    // Apply sorting
    jobsList.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance_score - a.relevance_score;
        case 'date':
          return new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime();
        case 'budget':
          return b.budget_score - a.budget_score;
        case 'client':
          return b.client_score - a.client_score;
        default:
          return 0;
      }
    });

    return jobsList;
  }, [jobs, filters, sortBy]);

  return (
    <div className="relative">
      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="font-semibold">Filters</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-md px-4 sm:px-6 py-3">
            <p className="text-xs sm:text-sm text-gray-500">Showing Results</p>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {filteredAndSortedJobs.length} <span className="text-sm sm:text-base text-gray-400">of {jobs.length}</span>
            </p>
          </div>
        </div>

        {/* Sort Dropdown - Modern Design */}
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 sm:px-5 py-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm font-medium text-gray-700 focus:outline-none cursor-pointer bg-transparent w-full sm:w-auto"
          >
            <option value="relevance">🎯 Best Match</option>
            <option value="date">🕒 Newest First</option>
            <option value="budget">💰 Highest Budget</option>
            <option value="client">⭐ Best Client</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Filter Sidebar - Desktop Only */}
        <aside className="w-80 flex-shrink-0 hidden lg:block">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </aside>

        {/* Job Cards Feed */}
        <main className="flex-1 w-full min-w-0">
          {filteredAndSortedJobs.length > 0 ? (
            <div className="space-y-5">
              {filteredAndSortedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
              <button
                onClick={() => setFilters({ minScore: 0, maxScore: 100, jobType: '', experienceLevel: '' })}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

