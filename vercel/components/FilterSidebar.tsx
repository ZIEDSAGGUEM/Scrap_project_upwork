'use client';

/**
 * FilterSidebar Component
 * Modern filter panel with beautiful design
 */

interface FilterSidebarProps {
  filters: {
    minScore: number;
    maxScore: number;
    jobType: string;
    experienceLevel: string;
  };
  onFilterChange: (filters: any) => void;
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const activeFiltersCount = [
    filters.minScore > 0,
    filters.jobType,
    filters.experienceLevel,
  ].filter(Boolean).length;

  return (
    <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-xl lg:sticky lg:top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-blue-600 font-semibold">{activeFiltersCount} active</p>
            )}
          </div>
        </div>
      </div>

      {/* Score Range Slider */}
      <div className="mb-7">
        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
          Minimum Score
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minScore}
            onChange={(e) =>
              onFilterChange({ ...filters, minScore: Number(e.target.value) })
            }
            className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white"
          />
          <div className="flex justify-between mt-3">
            <span className="text-xs font-bold text-gray-500">0%</span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black rounded-full shadow-md">
              {filters.minScore}%+
            </span>
            <span className="text-xs font-bold text-gray-500">100%</span>
          </div>
        </div>
      </div>

      {/* Job Type Radio Buttons */}
      <div className="mb-7">
        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
          Job Type
        </label>
        <div className="space-y-2">
          {[
            { value: '', label: '💼 All Types', gradient: 'from-gray-50 to-gray-100' },
            { value: 'hourly', label: '⏰ Hourly', gradient: 'from-blue-50 to-indigo-50' },
            { value: 'fixed', label: '💰 Fixed Price', gradient: 'from-green-50 to-emerald-50' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                filters.jobType === option.value
                  ? 'bg-gradient-to-r ' + option.gradient + ' border-blue-400 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="jobType"
                value={option.value}
                checked={filters.jobType === option.value}
                onChange={(e) => onFilterChange({ ...filters, jobType: e.target.value })}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level Radio Buttons */}
      <div className="mb-7">
        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
          Experience Level
        </label>
        <div className="space-y-2">
          {[
            { value: '', label: '🌟 All Levels', gradient: 'from-gray-50 to-gray-100' },
            { value: 'Entry', label: '🌱 Entry Level', gradient: 'from-green-50 to-emerald-50' },
            { value: 'Intermediate', label: '🚀 Intermediate', gradient: 'from-blue-50 to-indigo-50' },
            { value: 'Expert', label: '👑 Expert', gradient: 'from-purple-50 to-pink-50' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                filters.experienceLevel === option.value
                  ? 'bg-gradient-to-r ' + option.gradient + ' border-blue-400 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={option.value}
                checked={filters.experienceLevel === option.value}
                onChange={(e) =>
                  onFilterChange({ ...filters, experienceLevel: e.target.value })
                }
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() =>
          onFilterChange({
            minScore: 0,
            maxScore: 100,
            jobType: '',
            experienceLevel: '',
          })
        }
        className="w-full px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset All Filters
      </button>
    </div>
  );
}

