/**
 * Settings Page
 * Allows users to edit their preferences
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { SettingsForm } from '@/components/SettingsForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    // Fetch user preferences
    const { data: preferences, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching preferences:', error);
      // Return default values if no preferences exist
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">⚙️ Settings</h1>
                <p className="text-gray-600 mt-2">Configure your job matching preferences</p>
              </div>
            </div>

            {/* No Preferences Alert */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-bold text-yellow-900 mb-1">No Preferences Found</h3>
                  <p className="text-sm text-yellow-800">
                    Set up your preferences below to get started with AI-powered job matching!
                  </p>
                </div>
              </div>
            </div>

            <SettingsForm
              initialPreferences={{
                skills: [],
                min_budget: 0,
                preferred_countries: [],
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-3 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">⚙️ Settings</h1>
              <p className="text-gray-600 mt-2">Configure your job matching preferences</p>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md p-4 border-2 border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Skills</p>
              <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {preferences.skills?.length || 0}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md p-4 border-2 border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Min Budget</p>
              <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${preferences.min_budget || 0}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md p-4 border-2 border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Countries</p>
              <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {preferences.preferred_countries?.length || 0}
              </p>
            </div>
          </div>

          <SettingsForm initialPreferences={preferences} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Settings page error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Error Loading Settings</h1>
          <p className="text-gray-600 mb-6">Please try refreshing the page</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}

