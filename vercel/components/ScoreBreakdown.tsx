/**
 * ScoreBreakdown Component
 * Displays detailed score breakdown for a job
 */

import { getScoreColor } from '@/lib/utils/formatting';

interface ScoreBreakdownProps {
  relevanceScore: number;
  embeddingSimilarity: number;
  budgetScore: number;
  clientScore: number;
  skillsScore: number;
}

export function ScoreBreakdown({
  relevanceScore,
  embeddingSimilarity,
  budgetScore,
  clientScore,
  skillsScore,
}: ScoreBreakdownProps) {
  const scores = [
    {
      label: 'AI Similarity',
      score: Math.round(embeddingSimilarity),
      weight: 40,
      description: 'How well the job description matches your skills',
      icon: '🤖',
    },
    {
      label: 'Budget Match',
      score: Math.round(budgetScore),
      weight: 20,
      description: 'Budget meets your minimum requirements',
      icon: '💰',
    },
    {
      label: 'Client Quality',
      score: Math.round(clientScore),
      weight: 20,
      description: 'Client spending history and reliability',
      icon: '⭐',
    },
    {
      label: 'Skills Match',
      score: Math.round(skillsScore),
      weight: 20,
      description: 'How many required skills you have',
      icon: '🎯',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Score Breakdown</h2>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Overall Relevance Score</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(relevanceScore)}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${getScoreColor(relevanceScore)}`}>
            {relevanceScore >= 70 ? '🎉 Excellent' : relevanceScore >= 50 ? '👍 Good' : '😐 Fair'}
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="space-y-4">
        {scores.map((item) => (
          <div key={item.label} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <span className="text-xs text-gray-500">({item.weight}% weight)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(item.score)}`}>
                {item.score}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  item.score >= 70
                    ? 'bg-green-500'
                    : item.score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Formula Explanation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Score Formula:</p>
        <p>
          Overall = (40% × AI) + (20% × Budget) + (20% × Client) + (20% × Skills)
        </p>
      </div>
    </div>
  );
}

