// types/trophies.ts
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: TrophyRequirement;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  reward?: {
    gems?: number;
    title?: string;
  };
  unlocked?: boolean;
  unlockDate?: string;
  progress?: number;
}

export interface PositionCounts {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  dailyFirstPlace: number;
  weeklyFirstPlace: number;
}

// types/trophies.ts

export type TrophyRequirement = 
  // Basic stats
  | { type: 'puzzles_completed'; value: number }
  | { type: 'daily_challenges'; value: number }
  | { type: 'weekly_challenges'; value: number }
  | { type: 'perfect_games'; value: number }
  | { type: 'accuracy'; value: number }
  | { type: 'streak'; value: number }
  | { type: 'current_streak'; value: number }
  | { type: 'longest_streak'; value: number }
  | { type: 'daily_play'; value: number }
  | { type: 'weekend_play'; value: number }
  | { type: 'total_play_time'; value: number }
  | { type: 'total_moves'; value: number }
  
  // Position trophies
  | { type: 'first_place'; value: number }
  | { type: 'second_place'; value: number }
  | { type: 'third_place'; value: number }
  | { type: 'daily_first_place'; value: number }
  | { type: 'weekly_first_place'; value: number }
  
  // Speed trophies - ADD THESE
  | { type: 'speed_demon'; value: number }
  | { type: 'speed_legend'; value: number };

export const TROPHIES: Trophy[] = [
  // 🟢 COMMON TROPHIES
  {
    id: 'first_puzzle',
    name: 'First Steps',
    description: 'Complete your first puzzle',
    icon: '🎯',
    requirement: { type: 'puzzles_completed', value: 1 },
    rarity: 'Common',
    reward: { gems: 10 }
  },
  {
    id: 'puzzle_10',
    name: 'Puzzle Apprentice',
    description: 'Complete 10 puzzles',
    icon: '🔰',
    requirement: { type: 'puzzles_completed', value: 10 },
    rarity: 'Common',
    reward: { gems: 20 }
  },
  {
    id: 'first_daily',
    name: 'Daily Player',
    description: 'Complete your first daily challenge',
    icon: '📅',
    requirement: { type: 'daily_challenges', value: 1 },
    rarity: 'Common',
    reward: { gems: 15 }
  },
  {
    id: 'first_weekly',
    name: 'Weekend Warrior',
    description: 'Complete your first weekly challenge',
    icon: '📆',
    requirement: { type: 'weekly_challenges', value: 1 },
    rarity: 'Common',
    reward: { gems: 15 }
  },
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Achieve a 3-day streak',
    icon: '🔥',
    requirement: { type: 'current_streak', value: 3 },
    rarity: 'Common',
    reward: { gems: 20 }
  },

  // 🔵 RARE TROPHIES
  {
    id: 'puzzle_50',
    name: 'Puzzle Enthusiast',
    description: 'Complete 50 puzzles',
    icon: '🎮',
    requirement: { type: 'puzzles_completed', value: 50 },
    rarity: 'Rare',
    reward: { gems: 50, title: 'Puzzle Master' }
  },
  {
    id: 'daily_7',
    name: 'Daily Devotee',
    description: 'Complete 7 daily challenges',
    icon: '📊',
    requirement: { type: 'daily_challenges', value: 7 },
    rarity: 'Rare',
    reward: { gems: 40 }
  },
  {
    id: 'weekly_4',
    name: 'Weekly Regular',
    description: 'Complete 4 weekly challenges (1 month)',
    icon: '🗓️',
    requirement: { type: 'weekly_challenges', value: 4 },
    rarity: 'Rare',
    reward: { gems: 40 }
  },
  {
    id: 'perfect_5',
    name: 'Perfect Streak',
    description: 'Achieve 5 perfect games',
    icon: '✨',
    requirement: { type: 'perfect_games', value: 5 },
    rarity: 'Rare',
    reward: { gems: 45 }
  },
  {
    id: 'streak_7',
    name: 'Week Long',
    description: 'Achieve a 7-day streak',
    icon: '🔥🔥',
    requirement: { type: 'current_streak', value: 7 },
    rarity: 'Rare',
    reward: { gems: 50 }
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a puzzle in under 60 seconds',
    icon: '⚡',
    requirement: { type: 'speed_demon', value: 60 },
    rarity: 'Rare',
    reward: { gems: 35 }
  },
  {
    id: 'accuracy_90',
    name: 'Precision Player',
    description: 'Achieve 90% accuracy on a puzzle',
    icon: '🎯',
    requirement: { type: 'accuracy', value: 90 },
    rarity: 'Rare',
    reward: { gems: 35 }
  },

  // 🥇 POSITION TROPHIES - NEW!
  {
    id: 'first_place_1',
    name: 'First Victory',
    description: 'Win 1st place in any challenge',
    icon: '🥇',
    requirement: { type: 'first_place', value: 1 },
    rarity: 'Rare',
    reward: { gems: 50 }
  },
  {
    id: 'first_place_5',
    name: 'Champion',
    description: 'Win 1st place 5 times',
    icon: '🥇🥇',
    requirement: { type: 'first_place', value: 5 },
    rarity: 'Epic',
    reward: { gems: 150, title: 'Champion' }
  },
  {
    id: 'first_place_10',
    name: 'Grand Champion',
    description: 'Win 1st place 10 times',
    icon: '👑',
    requirement: { type: 'first_place', value: 10 },
    rarity: 'Legendary',
    reward: { gems: 300, title: 'Grand Champion' }
  },
  {
    id: 'second_place_1',
    name: 'Silver Lining',
    description: 'Get 2nd place in any challenge',
    icon: '🥈',
    requirement: { type: 'second_place', value: 1 },
    rarity: 'Common',
    reward: { gems: 25 }
  },
  {
    id: 'second_place_5',
    name: 'Silver Collector',
    description: 'Get 2nd place 5 times',
    icon: '🥈🥈',
    requirement: { type: 'second_place', value: 5 },
    rarity: 'Rare',
    reward: { gems: 75 }
  },
  {
    id: 'second_place_10',
    name: 'Silver Master',
    description: 'Get 2nd place 10 times',
    icon: '🥈🥈🥈',
    requirement: { type: 'second_place', value: 10 },
    rarity: 'Epic',
    reward: { gems: 150 }
  },
  {
    id: 'third_place_1',
    name: 'Bronze Star',
    description: 'Get 3rd place in any challenge',
    icon: '🥉',
    requirement: { type: 'third_place', value: 1 },
    rarity: 'Common',
    reward: { gems: 15 }
  },
  {
    id: 'third_place_5',
    name: 'Bronze Medalist',
    description: 'Get 3rd place 5 times',
    icon: '🥉🥉',
    requirement: { type: 'third_place', value: 5 },
    rarity: 'Rare',
    reward: { gems: 50 }
  },
  {
    id: 'third_place_10',
    name: 'Bronze Collector',
    description: 'Get 3rd place 10 times',
    icon: '🥉🥉🥉',
    requirement: { type: 'third_place', value: 10 },
    rarity: 'Epic',
    reward: { gems: 100 }
  },

  // 📅 CHALLENGE-SPECIFIC POSITION TROPHIES
  {
    id: 'daily_first_3',
    name: 'Daily Dominator',
    description: 'Win 1st place in 3 daily challenges',
    icon: '📅🥇',
    requirement: { type: 'daily_first_place', value: 3 },
    rarity: 'Epic',
    reward: { gems: 100, title: 'Daily Dominator' }
  },
  {
    id: 'daily_first_7',
    name: 'Daily Legend',
    description: 'Win 1st place in 7 daily challenges',
    icon: '📅👑',
    requirement: { type: 'daily_first_place', value: 7 },
    rarity: 'Legendary',
    reward: { gems: 200, title: 'Daily Legend' }
  },
  {
    id: 'weekly_first_2',
    name: 'Weekly Warrior',
    description: 'Win 1st place in 2 weekly challenges',
    icon: '📆🥇',
    requirement: { type: 'weekly_first_place', value: 2 },
    rarity: 'Epic',
    reward: { gems: 100, title: 'Weekly Warrior' }
  },
  {
    id: 'weekly_first_4',
    name: 'Weekly Champion',
    description: 'Win 1st place in 4 weekly challenges (1 month)',
    icon: '📆👑',
    requirement: { type: 'weekly_first_place', value: 4 },
    rarity: 'Legendary',
    reward: { gems: 200, title: 'Weekly Champion' }
  },

  // 🟣 EPIC TROPHIES (existing)
  {
    id: 'puzzle_100',
    name: 'Puzzle Veteran',
    description: 'Complete 100 puzzles',
    icon: '🏆',
    requirement: { type: 'puzzles_completed', value: 100 },
    rarity: 'Epic',
    reward: { gems: 100, title: 'Veteran' }
  },
  {
    id: 'daily_30',
    name: 'Monthly Warrior',
    description: 'Complete 30 daily challenges (1 month)',
    icon: '📅✨',
    requirement: { type: 'daily_challenges', value: 30 },
    rarity: 'Epic',
    reward: { gems: 80 }
  },
  {
    id: 'weekly_12',
    name: 'Seasoned Player',
    description: 'Complete 12 weekly challenges (3 months)',
    icon: '🗓️✨',
    requirement: { type: 'weekly_challenges', value: 12 },
    rarity: 'Epic',
    reward: { gems: 80 }
  },
  {
    id: 'perfect_20',
    name: 'Perfectionist',
    description: 'Achieve 20 perfect games',
    icon: '🌟',
    requirement: { type: 'perfect_games', value: 20 },
    rarity: 'Epic',
    reward: { gems: 100, title: 'Perfectionist' }
  },
  {
    id: 'streak_30',
    name: 'Month Long',
    description: 'Achieve a 30-day streak',
    icon: '🔥🔥🔥',
    requirement: { type: 'current_streak', value: 30 },
    rarity: 'Epic',
    reward: { gems: 150 }
  },

  // 🏆 LEGENDARY TROPHIES (existing)
  {
    id: 'puzzle_500',
    name: 'Puzzle Legend',
    description: 'Complete 500 puzzles',
    icon: '👑',
    requirement: { type: 'puzzles_completed', value: 500 },
    rarity: 'Legendary',
    reward: { gems: 500, title: 'Legend' }
  },
  {
    id: 'daily_365',
    name: 'Year of Dedication',
    description: 'Complete 365 daily challenges (1 year)',
    icon: '📅👑',
    requirement: { type: 'daily_challenges', value: 365 },
    rarity: 'Legendary',
    reward: { gems: 500, title: 'Daily Legend' }
  },
  {
    id: 'weekly_52',
    name: 'Year of Weeks',
    description: 'Complete 52 weekly challenges (1 year)',
    icon: '🗓️👑',
    requirement: { type: 'weekly_challenges', value: 52 },
    rarity: 'Legendary',
    reward: { gems: 500, title: 'Weekly Legend' }
  },
  {
    id: 'perfect_100',
    name: 'Absolute Perfection',
    description: 'Achieve 100 perfect games',
    icon: '💫',
    requirement: { type: 'perfect_games', value: 100 },
    rarity: 'Legendary',
    reward: { gems: 1000, title: 'Perfect Legend' }
  },
  {
    id: 'streak_365',
    name: 'Year Long',
    description: 'Achieve a 365-day streak',
    icon: '🔥👑',
    requirement: { type: 'current_streak', value: 365 },
    rarity: 'Legendary',
    reward: { gems: 1000, title: 'Streak Legend' }
  },
];