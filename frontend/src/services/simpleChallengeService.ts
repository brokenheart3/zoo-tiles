// src/services/simpleChallengeService.ts
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const getChallengePlayerCount = async (type: 'daily' | 'weekly'): Promise<number> => {
  try {
    const db = getFirestore();
    const now = new Date();
    
    // Generate challenge ID matching your format
    let challengeId: string;
    if (type === 'daily') {
      const dateStr = now.toISOString().split('T')[0];
      challengeId = `daily-${dateStr}`;
    } else {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      challengeId = `weekly-${weekNumber}`;
    }
    
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      return challengeDoc.data().playerCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting player count:', error);
    return 0; // Return 0 instead of throwing so UI doesn't crash
  }
};