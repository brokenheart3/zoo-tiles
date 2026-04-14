// src/services/simpleChallengeService.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, increment, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { Category } from './api';
import { getUTCDateString, getWeekNumber as getWeekNumberUtil } from "../utils/timeUtils";

// Helper function to get week number as number
function getWeekNumber(date: Date): number {
  return parseInt(getWeekNumberUtil(date), 10);
}

export const getChallengePlayerCount = async (challengeType: 'daily' | 'weekly', category: string): Promise<number> => {
  try {
    const weekNum = getWeekNumber(new Date());
    const challengeId = challengeType === 'daily' 
      ? `daily-${getUTCDateString()}-${category}`
      : `weekly-${weekNum}-${category}`;
    
    console.log(`🔍 Getting player count for: ${challengeId}`);
    
    // Get from challenges collection
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      const data = challengeDoc.data();
      const count = data.playerCount || 0;
      console.log(`✅ Player count from challenges: ${count}`);
      return count;
    }
    
    console.log(`⚠️ No challenge found for ${challengeId}, returning 0`);
    return 0;
  } catch (error) {
    console.error('Error getting player count:', error);
    return 0;
  }
};

export const incrementChallengePlayerCount = async (
  type: 'daily' | 'weekly',
  category?: Category
): Promise<void> => {
  try {
    const weekNum = getWeekNumber(new Date());
    const challengeId = type === 'daily' 
      ? `daily-${getUTCDateString()}-${category || 'animals'}`
      : `weekly-${weekNum}-${category || 'animals'}`;
    
    console.log(`📈 Incrementing player count for ${type} challenge:`, challengeId);
    
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      // Update existing document
      await updateDoc(challengeRef, {
        playerCount: increment(1),
        lastUpdated: new Date().toISOString()
      });
      console.log(`✅ Player count incremented to ${(challengeDoc.data()?.playerCount || 0) + 1}`);
    } else {
      // Create new document with count 1
      await setDoc(challengeRef, {
        id: challengeId,
        type: type,
        playerCount: 1,
        category: category || 'animals',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      console.log(`✅ New challenge document created with player count 1`);
    }
    
    // Verify the update
    const verifyDoc = await getDoc(challengeRef);
    console.log(`🔍 Verification - Player count is now: ${verifyDoc.data()?.playerCount}`);
    
  } catch (error: any) {
    console.error('❌ Error incrementing player count:', error.code, error.message);
  }
};