'use client';

/**
 * Manual Pipeline Trigger Component
 * Allows manual execution of the scraping + AI pipeline
 */

import { useState } from 'react';

export function ManualPipelineTrigger() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET;
      
      const response = await fetch('/api/cron/run-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cronSecret && { 'Authorization': `Bearer ${cronSecret}` })
        }
      });

      const data = await response.json();

      if (response.ok) {
        const jobsScraped = data.scraped?.jobsScraped || 0;
        const jobsProcessed = data.processed?.success || 0;
        
        setResult({
          success: true,
          message: `✅ Success! ${jobsScraped} jobs scraped, ${jobsProcessed} processed`
        });
      } else {
        setResult({
          success: false,
          message: `❌ Error: ${data.error || 'Failed to run pipeline'}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Network error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🤖 Manual Pipeline Trigger</h3>
          <p className="text-sm text-gray-600 mb-4">
            Run the full job pipeline manually:
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span> Scrape Upwork for new jobs
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span> Generate AI embeddings
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span> Calculate relevance scores
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span> Send Telegram notifications
            </li>
          </ul>

          <button
            onClick={handleTrigger}
            disabled={isLoading}
            className={`
              w-full sm:w-auto px-6 py-3 rounded-xl font-semibold
              transition-all duration-300 flex items-center justify-center gap-2
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Pipeline...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Pipeline Now
              </>
            )}
          </button>

          {isLoading && (
            <p className="text-xs text-gray-500 mt-3">
              ⏱️ This may take 2-5 minutes. Please wait...
            </p>
          )}

          {result && (
            <div className={`
              mt-4 p-4 rounded-xl border-2
              ${result.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
              }
            `}>
              <p className="text-sm font-medium">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

