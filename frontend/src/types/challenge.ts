// src/types/challenge.ts
export type ChallengeType = 'daily' | 'weekly';
export type Difficulty = 'Expert';

export interface ChallengeParticipation {
  userId: string;
  challengeId: string;
  challengeType: ChallengeType;
  gridSize: string;
  score: number;
  displayName: string;
  photoURL?: string;
  submittedAt: Date;
  _score: number;
  _challengeId: string;
  _challengeType: ChallengeType;
}

export interface PlayerRank {
  position: number;
  totalPlayers: number;
  score: number;
  percentile: number;
  displayName: string;
  photoURL?: string;
}

export interface ChallengeStats {
  playerCount: number;
  completionCount: number;
  averageTime: number;
  bestTime: number;
}