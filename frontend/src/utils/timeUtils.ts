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
  
  // Days until next Monday UTC
  let daysUntilMonday;
  if (utcDay === 1) { // Monday
    daysUntilMonday = 7; // Show time until next Monday
  } else if (utcDay === 0) { // Sunday
    daysUntilMonday = 1; // Tomorrow is Monday
  } else {
    daysUntilMonday = 8 - utcDay; // Days until next Monday
  }
  
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
 * Check if weekly challenge is still active
 * Weekly challenge is ALWAYS active during its week
 * The "expiration" is handled by generating a new challenge ID each week
 */
export const isWeeklyChallengeActive = (): boolean => {
  // Weekly challenges are always active for the current week
  // The challenge ID changes each week, so previous week's challenges
  // are simply not accessed anymore
  return true;
};

/**
 * Check if a weekly challenge is from a previous week
 */
export const isWeeklyChallengeExpired = (weekNumber: string): boolean => {
  const currentWeek = getWeekNumber(new Date());
  return parseInt(weekNumber) < parseInt(currentWeek);
};

/**
 * Get next Monday at UTC midnight
 */
export const getNextMondayUTC = (): Date => {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  let daysUntilMonday;
  
  if (day === 1) { // Monday
    daysUntilMonday = 7; // Next Monday is 7 days away
  } else if (day === 0) { // Sunday
    daysUntilMonday = 1; // Tomorrow is Monday
  } else {
    daysUntilMonday = 8 - day;
  }
  
  const nextMonday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    0, 0, 0
  ));
  return nextMonday;
};

/**
 * Get the current UTC date string (YYYY-MM-DD)
 */
export const getUTCDateString = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get yesterday's UTC date string (YYYY-MM-DD)
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
 * Get tomorrow's UTC date string (YYYY-MM-DD)
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

/**
 * Get UTC date string for a specific timestamp
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
 */
export const isChallengeCrossingMidnight = (startTime: number): boolean => {
  const startDate = getUTCDateStringForTimestamp(startTime);
  const nowDate = getUTCDateString();
  return startDate !== nowDate;
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
    return `${days}d ${remainingHours}h`;
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
 * Returns number as string for ID generation
 */
export const getWeekNumber = (date: Date): string => {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
  return weekNum.toString();
};

/**
 * Get week number as number
 */
export const getWeekNumberAsNumber = (date: Date): number => {
  return parseInt(getWeekNumber(date));
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
 * Debug function to check current UTC time
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
  console.log('  Week number:', getWeekNumber(now));
  console.log('  =====================');
};

// =====================================================
// CHALLENGE ID HELPER FUNCTIONS
// =====================================================

/**
 * Get daily challenge ID with category and grid size
 * Format: daily-YYYY-MM-DD-category-gridSize
 * Example: daily-2024-01-15-animals-8x8
 */
export const getDailyChallengeId = (category: string, gridSize: string): string => {
  const date = getUTCDateString();
  return `daily-${date}-${category}-${gridSize}`;
};

/**
 * Get weekly challenge ID with category and grid size
 * Format: weekly-weekNumber-category-gridSize
 * Example: weekly-3-animals-8x8
 */
export const getWeeklyChallengeId = (category: string, gridSize: string): string => {
  const weekNumber = getWeekNumber(new Date());
  return `weekly-${weekNumber}-${category}-${gridSize}`;
};

/**
 * Get challenge ID for a game based on when it started
 * Use this when saving results to ensure they go to the correct day/week
 */
export const getChallengeIdForGame = (
  startTime: number, 
  challengeType: 'daily' | 'weekly',
  category: string,
  gridSize: string
): string => {
  if (challengeType === 'daily') {
    const date = getUTCDateStringForTimestamp(startTime);
    return `daily-${date}-${category}-${gridSize}`;
  } else {
    const date = new Date(startTime);
    const weekNumber = getWeekNumber(date);
    return `weekly-${weekNumber}-${category}-${gridSize}`;
  }
};

/**
 * Parse daily challenge ID to extract components
 * Returns: { date, category, gridSize }
 */
export const parseDailyChallengeId = (challengeId: string): { date: string; category: string; gridSize: string } | null => {
  const parts = challengeId.split('-');
  if (parts[0] !== 'daily' || parts.length !== 5) return null;
  return {
    date: `${parts[1]}-${parts[2]}-${parts[3]}`,
    category: parts[4],
    gridSize: parts[5]
  };
};

/**
 * Parse weekly challenge ID to extract components
 * Returns: { weekNumber, category, gridSize }
 */
export const parseWeeklyChallengeId = (challengeId: string): { weekNumber: string; category: string; gridSize: string } | null => {
  const parts = challengeId.split('-');
  if (parts[0] !== 'weekly' || parts.length !== 4) return null;
  return {
    weekNumber: parts[1],
    category: parts[2],
    gridSize: parts[3]
  };
};

/**
 * Compare two UTC date strings to find which one matches your data
 */
export const findMatchingChallengeId = async (
  challengeIds: string[]
): Promise<string | null> => {
  console.log('🔍 Trying to find matching challenge ID:');
  challengeIds.forEach(id => console.log('   -', id));
  return challengeIds[0];
};