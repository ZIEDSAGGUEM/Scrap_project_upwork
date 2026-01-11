/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format a date to a human-readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
}

/**
 * Format budget from JSONB field
 */
export function formatBudget(budget: any): string {
  if (!budget) return 'Not specified';

  if (budget.type === 'fixed') {
    return `$${budget.amount?.toLocaleString() || 0} (Fixed)`;
  } else if (budget.type === 'hourly') {
    const min = budget.hourly_min || 0;
    const max = budget.hourly_max || 0;
    return `$${min}-$${max}/hr`;
  }

  return 'Not specified';
}

/**
 * Get score color class based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

/**
 * Get score badge color
 */
export function getScoreBadgeColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Excellent Match';
  if (score >= 50) return 'Good Match';
  if (score >= 30) return 'Fair Match';
  return 'Poor Match';
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format client spend
 */
export function formatClientSpend(spend: number | null): string {
  if (!spend || spend === 0) return 'No history';
  return formatCurrency(spend) + ' spent';
}

/**
 * Get experience level badge color
 */
export function getExperienceLevelColor(level: string | null): string {
  switch (level?.toLowerCase()) {
    case 'expert':
      return 'bg-purple-100 text-purple-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'entry':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

