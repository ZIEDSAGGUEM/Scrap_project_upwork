'use client';

/**
 * SettingsForm Component
 * Form to update user preferences (skills, budget, notifications)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
  initialPreferences: {
    skills: string[];
    min_budget: number;
    preferred_countries: string[];
  };
}

export function SettingsForm({ initialPreferences }: SettingsFormProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(initialPreferences.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [minBudget, setMinBudget] = useState(initialPreferences.min_budget || 0);
  const [preferredCountries, setPreferredCountries] = useState<string[]>(
    initialPreferences.preferred_countries || []
  );
  const [newCountry, setNewCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add skill
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (newSkill.trim()) {
        if (!skills.includes(newSkill.trim())) {
          setSkills([...skills, newSkill.trim()]);
          setNewSkill('');
        } else {
          setMessage({ type: 'error', text: 'Skill already added' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Add country
  const handleAddCountry = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (newCountry.trim()) {
        if (!preferredCountries.includes(newCountry.trim())) {
          setPreferredCountries([...preferredCountries, newCountry.trim()]);
          setNewCountry('');
        } else {
          setMessage({ type: 'error', text: 'Country already added' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    }
  };

  // Remove country
  const handleRemoveCountry = (countryToRemove: string) => {
    setPreferredCountries(preferredCountries.filter((country) => country !== countryToRemove));
  };

  // Save preferences
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skills.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one skill' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          min_budget: minBudget,
          preferred_countries: preferredCountries,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '✓ Preferences saved successfully!' });
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to initial values
  const handleReset = () => {
    setSkills(initialPreferences.skills || []);
    setMinBudget(initialPreferences.min_budget || 0);
    setPreferredCountries(initialPreferences.preferred_countries || []);
    setMessage({ type: 'success', text: 'Reset to saved values' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl font-semibold ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-2 border-green-200'
              : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Skills Section */}
      <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Your Skills</h3>
            <p className="text-sm text-gray-500">Used for AI job matching</p>
          </div>
        </div>

        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="Type a skill and press Enter (e.g., React, Node.js)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />

        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No skills added yet. Start typing above!</p>
          ) : (
            skills.map((skill, index) => (
              <span
                key={index}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border-2 border-blue-200 font-semibold text-sm hover:border-blue-400 transition-all"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Minimum Budget Section */}
      <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Minimum Budget</h3>
            <p className="text-sm text-gray-500">Your minimum acceptable project budget</p>
          </div>
        </div>

        <label className="block text-sm font-bold text-gray-700 mb-3">
          Minimum Budget ($)
        </label>
        <input
          type="number"
          value={minBudget}
          onChange={(e) => setMinBudget(Number(e.target.value))}
          min="0"
          step="50"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <p className="text-sm text-blue-600 font-semibold">
          Minimum: ${minBudget.toLocaleString()}
        </p>
      </div>

      {/* Preferred Countries Section */}
      <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Preferred Countries</h3>
            <p className="text-sm text-gray-500">Client locations you prefer (optional)</p>
          </div>
        </div>

        <input
          type="text"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
          onKeyDown={handleAddCountry}
          placeholder="Type a country and press Enter (e.g., United States)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <div className="flex flex-wrap gap-2">
          {preferredCountries.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No countries added. Leave empty to accept all countries.</p>
          ) : (
            preferredCountries.map((country, index) => (
              <span
                key={index}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full border-2 border-purple-200 font-semibold text-sm hover:border-purple-400 transition-all"
              >
                {country}
                <button
                  type="button"
                  onClick={() => handleRemoveCountry(country)}
                  className="hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading || skills.length === 0}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Preferences
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

