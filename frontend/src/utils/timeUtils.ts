// src/utils/timeUtils.ts

/**
 * Get current UTC date - FIXED to avoid timezone confusion
 */
const getUTCDate = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  ));
};

/**
 * Format a date object to readable string (UTC-based)
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Format a date with time (UTC-based)
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

/**
 * Get relative time string (e.g., "2 days ago") - UTC-based
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = getUTCDate();
  const targetDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ));
  
  const diffTime = Math.abs(now.getTime() - targetDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 30) {
    return formatDate(targetDate);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Calculate time remaining until next UTC midnight (for daily challenges)
 * This ensures all players worldwide have the same expiration time
 */
export const getDailyTimeRemaining = (): string => {
  const now = new Date();
  
  // Create UTC midnight for tomorrow
  const utcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1, // Tomorrow
    0, 0, 0 // Midnight UTC
  ));
  
  const diff = utcMidnight.getTime() - now.getTime();
  if (diff <= 0) return 'Expired!';
  return formatTimeRemaining(diff);
};

/**
 * Calculate time remaining until next Monday 00:00 UTC (for weekly challenges)
 */
export const getWeeklyTimeRemaining = (): string => {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc. in UTC
  
  // Days until next Monday UTC (if today is Monday, show time until next week's Monday)
  let daysUntilMonday = utcDay === 1 ? 7 : (8 - utcDay) % 7;
  if (daysUntilMonday === 0) daysUntilMonday = 7; // If today is Monday, go to next Monday
  
  // Create date for next Monday at UTC midnight
  const nextMonday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    0, 0, 0
  ));
  
  const diff = nextMonday.getTime() - now.getTime();
  if (diff <= 0) return 'Expired!';
  return formatTimeRemaining(diff);
};

/**
 * Generic time remaining calculator
 */
export const getTimeRemaining = (type: 'daily' | 'weekly'): string => {
  return type === 'daily' ? getDailyTimeRemaining() : getWeeklyTimeRemaining();
};

/**
 * Check if daily challenge is still active (before UTC midnight)
 */
export const isDailyChallengeActive = (): boolean => {
  const now = new Date();
  
  const utcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  
  return now.getTime() < utcMidnight.getTime();
};

/**
 * Check if weekly challenge is still active (before Monday UTC midnight)
 */
export const isWeeklyChallengeActive = (): boolean => {
  const now = new Date();
  const nextMonday = getNextMondayUTC();
  return now.getTime() < nextMonday.getTime();
};

/**
 * Get next Monday at UTC midnight
 */
export const getNextMondayUTC = (): Date => {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  
  const nextMonday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    0, 0, 0
  ));
  return nextMonday;
};

/**
 * Get the current UTC date string (YYYY-MM-DD) - FIXED with debug logging
 */
export const getUTCDateString = (): string => {
  const now = new Date();
  
  // Debug log to see what's happening
  console.log('🔍 getUTCDateString called:');
  console.log('   Local time:', now.toString());
  console.log('   Local hours:', now.getHours());
  console.log('   UTC hours:', now.getUTCHours());
  console.log('   UTC date:', now.getUTCDate());
  console.log('   UTC month:', now.getUTCMonth() + 1);
  console.log('   UTC year:', now.getUTCFullYear());
  
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  console.log('   Generated UTC date string:', result);
  
  return result;
};

/**
 * Get yesterday's UTC date string (YYYY-MM-DD) - useful for debugging
 */
export const getYesterdayUTCDateString = (): string => {
  const now = new Date();
  const yesterday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  ));
  
  const year = yesterday.getUTCFullYear();
  const month = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get tomorrow's UTC date string (YYYY-MM-DD) - useful for debugging
 */
export const getTomorrowUTCDateString = (): string => {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  ));
  
  const year = tomorrow.getUTCFullYear();
  const month = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// =====================================================
// NEW FUNCTIONS ADDED FOR MIDNIGHT CROSSOVER HANDLING
// =====================================================

/**
 * Get UTC date string for a specific timestamp
 * Useful for determining which challenge a game belongs to when crossing midnight
 */
export const getUTCDateStringForTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a challenge started before UTC midnight but finished after
 * Returns true if the game crosses the UTC midnight boundary
 */
export const isChallengeCrossingMidnight = (startTime: number): boolean => {
  const startDate = getUTCDateStringForTimestamp(startTime);
  const nowDate = getUTCDateString();
  return startDate !== nowDate;
};

/**
 * Get the challenge ID for a game based on when it started
 * Use this when saving results to ensure they go to the correct day
 */
export const getChallengeIdForGame = (startTime: number, challengeType: 'daily' | 'weekly'): string => {
  if (challengeType === 'daily') {
    return `daily-${getUTCDateStringForTimestamp(startTime)}`;
  } else {
    // For weekly challenges, use the week number of the start time
    const date = new Date(startTime);
    const weekNumber = getWeekNumber(date);
    return `weekly-${weekNumber}`;
  }
};

// =====================================================
// END OF NEW FUNCTIONS
// =====================================================

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
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Get week number (for weekly challenges) - UTC-based
 */
export const getWeekNumber = (date: Date): string => {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7).toString();
};

/**
 * Format seconds into MM:SS format (for game times)
 */
export const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0 || seconds === Infinity) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format minutes into hours and minutes (for total play time)
 */
export const formatPlayTime = (totalMinutes: number): string => {
  if (!totalMinutes || totalMinutes === 0) return '0 min';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  if (hours === 0) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Get day name from date (UTC-based)
 */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    timeZone: 'UTC' 
  });
};

/**
 * Get month name from date (UTC-based)
 */
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'long',
    timeZone: 'UTC' 
  });
};

/**
 * Check if a date is today (UTC-based)
 */
export const isToday = (date: Date): boolean => {
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();
};

/**
 * Check if a date is in the weekend (Saturday or Sunday) - UTC-based
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

/**
 * Debug function to check current UTC time - ENHANCED
 */
export const debugUTCTime = (): void => {
  const now = new Date();
  console.log('🕐 ===== UTC DEBUG =====');
  console.log('  Local time:', now.toString());
  console.log('  Local hours:', now.getHours());
  console.log('  Local date:', now.getDate());
  console.log('  UTC ISO:', now.toISOString());
  console.log('  UTC hours:', now.getUTCHours());
  console.log('  UTC date:', now.getUTCDate());
  console.log('  UTC month:', now.getUTCMonth() + 1);
  console.log('  UTC year:', now.getUTCFullYear());
  console.log('  UTC day of week:', now.getUTCDay());
  console.log('  UTC date string:', getUTCDateString());
  console.log('  Yesterday UTC:', getYesterdayUTCDateString());
  console.log('  Tomorrow UTC:', getTomorrowUTCDateString());
  console.log('  Daily active:', isDailyChallengeActive());
  console.log('  Daily remaining:', getDailyTimeRemaining());
  console.log('  Weekly active:', isWeeklyChallengeActive());
  console.log('  Weekly remaining:', getWeeklyTimeRemaining());
  console.log('  =====================');
};

/**
 * Compare two UTC date strings to find which one matches your data
 */
export const findMatchingChallengeId = async (
  challengeIds: string[]
): Promise<string | null> => {
  console.log('🔍 Trying to find matching challenge ID:');
  challengeIds.forEach(id => console.log('   -', id));
  // This function would need to check your database
  return challengeIds[0]; // Return the first one for now
};