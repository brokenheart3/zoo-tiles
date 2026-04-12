// src/hooks/useChallengeTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { challengeService } from '../services/challengeService';
import type { ChallengeType, PlayerRank, ChallengeCategory } from '../types/challenge';

interface UseChallengeTrackerProps {
  challengeType: ChallengeType;
  category: ChallengeCategory;  // Add category parameter
  userId?: string;
  gridSize: string;
}

export function useChallengeTracker({
  challengeType,
  category,  // Add category
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
        // Fix: Pass category parameter
        const count = await challengeService.getChallengePlayerCount(challengeType, category);
        setPlayerCount(count);
        
        // Fix: Pass category parameter
        const participated = await challengeService.hasPlayerParticipated(challengeType, category, userId);
        setHasParticipated(participated);
        
        if (participated) {
          // Fix: Pass category parameter
          const rank = await challengeService.getPlayerRank(challengeType, category, userId);
          setPlayerRank(rank);
        }
      } catch (error) {
        console.error('Error loading challenge data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [challengeType, category, userId, gridSize]);

  const submitScore = useCallback(async (
    score: number,
    displayName: string,
    photoURL?: string
  ) => {
    if (!userId) throw new Error('User ID required');
    
    // Fix: Add category parameter
    const result = await challengeService.submitChallengeCompletion(
      userId,
      challengeType,
      gridSize,
      category,  // Add category parameter
      score,
      displayName,
      photoURL
    );
    
    setPlayerCount(result.playerCount);
    setHasParticipated(true);
    
    // Fix: Pass category parameter
    const rank = await challengeService.getPlayerRank(challengeType, category, userId);
    setPlayerRank(rank);
    
    return result;
  }, [userId, challengeType, category, gridSize]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    // Fix: Pass category parameter
    const count = await challengeService.getChallengePlayerCount(challengeType, category);
    setPlayerCount(count);
    
    if (hasParticipated) {
      // Fix: Pass category parameter
      const rank = await challengeService.getPlayerRank(challengeType, category, userId);
      setPlayerRank(rank);
    }
  }, [challengeType, category, userId, hasParticipated]);

  return {
    playerCount,
    playerRank,
    hasParticipated,
    loading,
    submitScore,
    refresh
  };
}