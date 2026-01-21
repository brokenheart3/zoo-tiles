// src/services/challengeService.ts
import { 
  getFirestore, 
  doc, 
  setDoc, 
  increment, 
  serverTimestamp, 
  getDoc, 
  collection, 
  query, 
  where, 
  getCountFromServer,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

// Import from relative path instead of @/ alias
import {
  ChallengeType,
  ChallengeParticipation,
  PlayerRank,
  ChallengeStats
} from '../types/challenge';

export class ChallengeService {
  private db = getFirestore();

  generateChallengeId(type: ChallengeType): string {
    const now = new Date();
    
    if (type === 'daily') {
      const dateStr = now.toISOString().split('T')[0];
      return `daily-${dateStr}`;
    } else {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `weekly-${weekNumber}`;
    }
  }

  async submitChallengeCompletion(
    userId: string,
    challengeType: ChallengeType,
    gridSize: string,
    score: number,
    displayName: string,
    photoURL?: string
  ): Promise<{ playerCount: number; challengeId: string }> {
    
    const challengeId = this.generateChallengeId(challengeType);
    
    // Save player's participation
    const participationRef = doc(
      this.db, 
      'challenges', 
      challengeId, 
      'participations', 
      userId
    );
    
    const participation: ChallengeParticipation = {
      userId,
      challengeId,
      challengeType,
      gridSize,
      score,
      displayName,
      photoURL,
      submittedAt: new Date(),
      _score: score,
      _challengeId: challengeId,
      _challengeType: challengeType
    };
    
    await setDoc(participationRef, {
      ...participation,
      submittedAt: serverTimestamp()
    }, { merge: true });
    
    // Update challenge player count
    const challengeRef = doc(this.db, 'challenges', challengeId);
    await setDoc(challengeRef, {
      id: challengeId,
      type: challengeType,
      playerCount: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    // Get updated player count
    const challengeDoc = await getDoc(challengeRef);
    const playerCount = challengeDoc.data()?.playerCount || 0;
    
    return { playerCount, challengeId };
  }

  async getChallengePlayerCount(challengeType: ChallengeType): Promise<number> {
    try {
      const challengeId = this.generateChallengeId(challengeType);
      const challengeRef = doc(this.db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (challengeDoc.exists()) {
        const data = challengeDoc.data();
        return data.playerCount || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting player count:', error);
      return 0;
    }
  }

  async getPlayerRank(
    challengeType: ChallengeType,
    userId: string
  ): Promise<PlayerRank | null> {
    try {
      const challengeId = this.generateChallengeId(challengeType);
      
      // Get player's participation
      const participationRef = doc(
        this.db, 
        'challenges', 
        challengeId, 
        'participations', 
        userId
      );
      const participationDoc = await getDoc(participationRef);
      
      if (!participationDoc.exists()) return null;
      
      const playerData = participationDoc.data() as ChallengeParticipation;
      const playerScore = playerData.score;
      
      // Count players with better scores (lower time = better)
      const participationsRef = collection(
        this.db, 
        'challenges', 
        challengeId, 
        'participations'
      );
      
      const betterPlayersQuery = query(
        participationsRef,
        where('_score', '<', playerScore)
      );
      const betterCount = await getCountFromServer(betterPlayersQuery);
      
      const totalQuery = query(participationsRef);
      const totalCount = await getCountFromServer(totalQuery);
      
      const position = betterCount.data().count + 1;
      const totalPlayers = totalCount.data().count;
      const percentile = totalPlayers > 0 
        ? Math.round(((totalPlayers - position) / totalPlayers) * 100)
        : 100;
      
      return {
        position,
        totalPlayers,
        score: playerScore,
        percentile,
        displayName: playerData.displayName,
        photoURL: playerData.photoURL
      };
    } catch (error) {
      console.error('Error getting player rank:', error);
      return null;
    }
  }

  async hasPlayerParticipated(
    challengeType: ChallengeType,
    userId: string
  ): Promise<boolean> {
    try {
      const challengeId = this.generateChallengeId(challengeType);
      const participationRef = doc(
        this.db, 
        'challenges', 
        challengeId, 
        'participations', 
        userId
      );
      const participationDoc = await getDoc(participationRef);
      return participationDoc.exists();
    } catch (error) {
      console.error('Error checking participation:', error);
      return false;
    }
  }

  async getChallengeLeaderboard(
    challengeType: ChallengeType,
    limitCount: number = 10
  ): Promise<ChallengeParticipation[]> {
    try {
      const challengeId = this.generateChallengeId(challengeType);
      const participationsRef = collection(
        this.db, 
        'challenges', 
        challengeId, 
        'participations'
      );
      
      const leaderboardQuery = query(
        participationsRef,
        orderBy('_score', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(leaderboardQuery);
      const leaderboard: ChallengeParticipation[] = [];
      
      snapshot.forEach((doc) => {
        leaderboard.push(doc.data() as ChallengeParticipation);
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}

export const challengeService = new ChallengeService();