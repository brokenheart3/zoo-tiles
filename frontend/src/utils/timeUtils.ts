// src/utils/timeUtils.ts

/**
 * Calculate time remaining until next midnight (for daily challenges)
 */
export const getDailyTimeRemaining = (): string => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  
  const diff = midnight.getTime() - now.getTime();
  return formatTimeRemaining(diff);
};

/**
 * Calculate time remaining until next Monday 00:00 (for weekly challenges)
 */
export const getWeeklyTimeRemaining = (): string => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Days until next Monday (if today is Monday, show time until next week's Monday)
  let daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  
  // Create date for next Monday
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  const diff = nextMonday.getTime() - now.getTime();
  return formatTimeRemaining(diff);
};

/**
 * Generic time remaining calculator
 */
export const getTimeRemaining = (type: 'daily' | 'weekly'): string => {
  return type === 'daily' ? getDailyTimeRemaining() : getWeeklyTimeRemaining();
};

/**
 * Format milliseconds into readable time string
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return 'Expired!';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${remainingHours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Get week number (same as your existing function)
 */
export const getWeekNumber = (date: Date): string => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();
};