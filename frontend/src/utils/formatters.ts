// utils/formatters.ts

// Format time from minutes to string
export const formatTime = (minutes: number, compact = false): string => {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (compact) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  if (hours < 24) return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days} day${days !== 1 ? 's' : ''}`;

  return `${days}d ${remainingHours}h`;
};

// Accuracy color based on percentage
export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return '#4CAF50';
  if (accuracy >= 75) return '#FF9800';
  return '#F44336';
};

// Streak color based on number of days
export const getStreakColor = (streak: number): string => {
  if (streak >= 14) return '#FF9800';
  if (streak >= 7) return '#4CAF50';
  return '#2196F3';
};

// Grid difficulty based on grid size string
export const getGridDifficulty = (gridSize: string): 'Easy' | 'Medium' | 'Hard' | 'Expert' => {
  switch (gridSize) {
    case '6x6': return 'Easy';
    case '8x8': return 'Medium';
    case '10x10': return 'Hard';
    case '12x12': return 'Expert';
    default: return 'Medium';
  }
};

// Color for difficulty labels
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return '#4CAF50';
    case 'Medium': return '#FF9800';
    case 'Hard': return '#F44336';
    case 'Expert': return '#9C27B0';
    default: return '#757575';
  }
};

// Format date from string or Date object
export const formatDate = (dateInput?: string | Date): string => {
  if (!dateInput) return 'Never';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format percentage
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format large numbers like 1500 -> 1.5K, 1_500_000 -> 1.5M
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};
