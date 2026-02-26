// src/services/simpleChallengeService.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, increment, collection, getDocs } from 'firebase/firestore';

export const getChallengePlayerCount = async (type: 'daily' | 'weekly'): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekNumber = getWeekNumber(new Date());
    
    const challengeId = type === 'daily' 
      ? `daily-${today}`
      : `weekly-${weekNumber}`;
    
    console.log(`🔍 Getting player count for ${type} challenge:`, challengeId);
    
    // METHOD 1: Try to get from challenge_participants collection (exists in rules)
    try {
      const participantsRef = doc(db, 'challenge_participants', challengeId);
      const participantsDoc = await getDoc(participantsRef);
      
      if (participantsDoc.exists()) {
        const data = participantsDoc.data();
        const count = data.playerCount || 0;
        console.log(`📊 ${type} challenge player count from participants: ${count}`);
        return count;
      }
    } catch (error) {
      console.log('No participants document found, trying daily/weekly challenges...');
    }
    
    // METHOD 2: Try daily_challenges or weekly_challenges collections
    try {
      const collectionName = type === 'daily' ? 'daily_challenges' : 'weekly_challenges';
      const challengeRef = doc(db, collectionName, challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (challengeDoc.exists()) {
        const data = challengeDoc.data();
        const count = data.participants || data.playerCount || 0;
        console.log(`📊 ${type} challenge player count from ${collectionName}: ${count}`);
        return count;
      }
    } catch (error) {
      console.log(`No ${type} challenge document found`);
    }
    
    // METHOD 3: Count from users' challenges (if you have permission)
    try {
      console.log('🔍 Counting from users challenges...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let completedCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const challengeRef = doc(db, 'users', userDoc.id, 'challenges', challengeId);
          const challengeDoc = await getDoc(challengeRef);
          
          if (challengeDoc.exists()) {
            const data = challengeDoc.data();
            if (data.completed === true) {
              completedCount++;
            }
          }
        } catch (err) {
          // Skip if no challenges subcollection
        }
      }
      
      console.log(`📊 Direct count from users: ${completedCount}`);
      return completedCount;
      
    } catch (error) {
      console.log('Could not count from users');
    }
    
    // If all methods fail, return 0
    console.log(`📊 No data found for ${challengeId}, returning 0`);
    return 0;
    
  } catch (error: any) {
    console.error('❌ Error getting player count:', error.code, error.message);
    return 0;
  }
};

export const incrementChallengePlayerCount = async (type: 'daily' | 'weekly'): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekNumber = getWeekNumber(new Date());
    
    const challengeId = type === 'daily' 
      ? `daily-${today}`
      : `weekly-${weekNumber}`;
    
    console.log(`📈 Incrementing player count for ${type} challenge:`, challengeId);
    
    // Try to increment in challenge_participants collection
    try {
      const participantsRef = doc(db, 'challenge_participants', challengeId);
      await setDoc(participantsRef, {
        playerCount: increment(1),
        lastUpdated: new Date().toISOString(),
        type,
        challengeId
      }, { merge: true });
      
      console.log(`✅ Player count incremented in challenge_participants`);
      return;
    } catch (error) {
      console.log('Could not increment in challenge_participants, trying daily/weekly...');
    }
    
    // Fallback: increment in daily_challenges or weekly_challenges
    try {
      const collectionName = type === 'daily' ? 'daily_challenges' : 'weekly_challenges';
      const challengeRef = doc(db, collectionName, challengeId);
      await setDoc(challengeRef, {
        participants: increment(1),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log(`✅ Player count incremented in ${collectionName}`);
    } catch (error) {
      console.error('❌ Could not increment player count anywhere');
    }
    
  } catch (error: any) {
    console.error('❌ Error incrementing player count:', error.code, error.message);
  }
};

// Helper function to get week number
function getWeekNumber(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7));
}