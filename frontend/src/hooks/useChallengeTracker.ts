// src/hooks/useChallengeTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { challengeService } from '../services/challengeService';
import type { ChallengeType, PlayerRank } from '../types/challenge';

interface UseChallengeTrackerProps {
  challengeType: ChallengeType;
  userId?: string;
  gridSize: string;
}

export function useChallengeTracker({
  challengeType,
  userId,
  gridSize
}: UseChallengeTrackerProps) {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [hasParticipated, setHasParticipated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const count = await challengeService.getChallengePlayerCount(challengeType);
        setPlayerCount(count);
        
        const participated = await challengeService.hasPlayerParticipated(challengeType, userId);
        setHasParticipated(participated);
        
        if (participated) {
          const rank = await challengeService.getPlayerRank(challengeType, userId);
          setPlayerRank(rank);
        }
      } catch (error) {
        console.error('Error loading challenge data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [challengeType, userId, gridSize]);

  const submitScore = useCallback(async (
    score: number,
    displayName: string,
    photoURL?: string
  ) => {
    if (!userId) throw new Error('User ID required');
    
    const result = await challengeService.submitChallengeCompletion(
      userId,
      challengeType,
      gridSize,
      score,
      displayName,
      photoURL
    );
    
    setPlayerCount(result.playerCount);
    setHasParticipated(true);
    
    const rank = await challengeService.getPlayerRank(challengeType, userId);
    setPlayerRank(rank);
    
    return result;
  }, [userId, challengeType, gridSize]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    const count = await challengeService.getChallengePlayerCount(challengeType);
    setPlayerCount(count);
    
    if (hasParticipated) {
      const rank = await challengeService.getPlayerRank(challengeType, userId);
      setPlayerRank(rank);
    }
  }, [challengeType, userId, hasParticipated]);

  return {
    playerCount,
    playerRank,
    hasParticipated,
    loading,
    submitScore,
    refresh
  };
}