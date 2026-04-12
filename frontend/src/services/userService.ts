// src/services/userService.ts (fixed)
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User } from "firebase/auth";
import LocalStorageService from "./localStorageService";

// Create a Firestore document for a new user if it doesn't exist
export const createUserIfNotExists = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  await LocalStorageService.initialize(user.uid);

  if (!snapshot.exists()) {
    const localData = await LocalStorageService.getData();
    
    await setDoc(userRef, {
      username: user.displayName || "Player",
      email: user.email,
      createdAt: new Date(),
      gridSize: localData?.settings.gridSize || "8x8",
      difficulty: localData?.settings.difficulty || "Easy",
      stats: {
        puzzlesSolved: localData?.stats.totalPuzzlesSolved || 0,
        currentStreak: localData?.stats.currentStreak || 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
        totalPlayTime: localData?.stats.totalPlayTime || 0,
        bestTime: 0,
        averageTime: 0,
        challengesCompleted: 0,
        perfectGames: localData?.stats.perfectGames || 0,
      },
    });
  } else {
    await syncLocalWithFirebase(user.uid);
  }
};

export const syncLocalWithFirebase = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const firebaseData = await getDoc(userRef);
  const localData = await LocalStorageService.getData();

  if (firebaseData.exists() && localData) {
    const fbStats = firebaseData.data().stats;
    const localStats = localData.stats;

    const mergedStats = {
      puzzlesSolved: Math.max(fbStats.puzzlesSolved, localStats.totalPuzzlesSolved),
      currentStreak: Math.max(fbStats.currentStreak, localStats.currentStreak),
      totalPlayTime: Math.max(fbStats.totalPlayTime, localStats.totalPlayTime),
      perfectGames: Math.max(fbStats.perfectGames, localStats.perfectGames),
    };

    await updateDoc(userRef, {
      'stats': mergedStats,
      lastSynced: new Date()
    });
  }
};

export const getDailyChallenge = async () => {
  const todayId = "daily-" + new Date().toISOString().split("T")[0];
  const challengeRef = doc(db, "challenges", todayId);
  const snapshot = await getDoc(challengeRef);
  if (snapshot.exists()) return snapshot.data();
  return null;
};

// ✅ FIXED: Get user's challenge result from the correct path
export const getUserChallengeResult = async (uid: string, challengeId: string) => {
  console.log('🔍 getUserChallengeResult:', { uid, challengeId });
  try {
    // Try both possible paths
    let result = null;
    
    // Path 1: users/{uid}/challenges/{challengeId}
    const userChallengeRef = doc(db, "users", uid, "challenges", challengeId);
    const userChallengeSnapshot = await getDoc(userChallengeRef);
    
    if (userChallengeSnapshot.exists()) {
      result = userChallengeSnapshot.data();
      console.log('✅ Found challenge in users/{uid}/challenges:', { challengeId, completed: result.completed, bestTime: result.bestTime });
      return result;
    }
    
    // Path 2: challenges/{challengeId}/participations/{uid}
    const participationRef = doc(db, "challenges", challengeId, "participations", uid);
    const participationSnapshot = await getDoc(participationRef);
    
    if (participationSnapshot.exists()) {
      result = participationSnapshot.data();
      console.log('✅ Found challenge in challenges/{challengeId}/participations:', { challengeId, completed: result.completed, bestTime: result.bestTime });
      return result;
    }
    
    console.log('❌ No challenge found for:', challengeId);
    return null;
  } catch (error) {
    console.error('Error getting challenge result:', error);
    return null;
  }
};

export const getUserAllChallenges = async (uid: string) => {
  try {
    const challengesRef = collection(db, "users", uid, "challenges");
    const snapshot = await getDocs(challengesRef);
    const challenges: any[] = [];
    snapshot.forEach((doc) => {
      challenges.push({ id: doc.id, ...doc.data() });
    });
    return challenges;
  } catch (error) {
    console.error('Error getting all challenges:', error);
    return [];
  }
};

// ✅ FIXED: Update user's challenge progress in both locations
export const updateUserChallenge = async (
  uid: string,
  challengeId: string,
  completed: boolean,
  time?: number,
  moves?: number,
  isPerfect?: boolean,
  correctMoves?: number,
  wrongMoves?: number,
  accuracy?: number
) => {
  console.log('📝 updateUserChallenge START:', { uid, challengeId, completed, time, moves, isPerfect });
  
  try {
    // Record in local storage
    if (challengeId.startsWith('daily-')) {
      await LocalStorageService.recordDailyChallenge(completed, time || 0, completed ? 100 : 0);
    }

    const challengeType = challengeId.startsWith('daily-') ? 'daily' : 'weekly';
    
    // Update in users/{uid}/challenges/{challengeId}
    const userChallengeRef = doc(db, "users", uid, "challenges", challengeId);
    const snapshot = await getDoc(userChallengeRef);

    const attempts = snapshot.exists() ? (snapshot.data()?.attempts || 0) + 1 : 1;
    
    // Get existing best time
    let bestTime = time;
    if (snapshot.exists() && snapshot.data()?.bestTime) {
      const existingBest = snapshot.data()?.bestTime;
      if (time && existingBest && time < existingBest) {
        bestTime = time;
      } else if (existingBest) {
        bestTime = existingBest;
      }
    }

    const data = {
      completed: true,
      attempts,
      bestTime: bestTime || time || 0,
      time: time || 0,
      moves: moves || 0,
      correctMoves: correctMoves || 0,
      wrongMoves: wrongMoves || 0,
      accuracy: accuracy || 0,
      isPerfect: isPerfect || false,
      completedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      challengeType: challengeType,
      challengeId: challengeId
    };
    
    console.log('📝 Saving to users/{uid}/challenges:', data);
    await setDoc(userChallengeRef, data, { merge: true });
    
    // Also update in challenges/{challengeId}/participations/{uid}
    const participationRef = doc(db, "challenges", challengeId, "participations", uid);
    const participationData = {
      userId: uid,
      challengeId: challengeId,
      challengeType: challengeType,
      completed: true,
      score: bestTime || time || 0,
      bestTime: bestTime || time || 0,
      time: time || 0,
      moves: moves || 0,
      correctMoves: correctMoves || 0,
      wrongMoves: wrongMoves || 0,
      accuracy: accuracy || 0,
      isPerfect: isPerfect || false,
      completedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      _score: bestTime || time || 0
    };
    
    console.log('📝 Saving to challenges/{challengeId}/participations:', participationData);
    await setDoc(participationRef, participationData, { merge: true });
    
    // Update user's stats for weekly/daily completion counts
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const stats = userDoc.data()?.stats || {};
      const updateFields: any = {};
      
      if (challengeType === 'daily') {
        updateFields['stats.dailyCompleted'] = (stats.dailyCompleted || 0) + 1;
      } else {
        updateFields['stats.weeklyCompleted'] = (stats.weeklyCompleted || 0) + 1;
      }
      updateFields['stats.challengesCompleted'] = (stats.challengesCompleted || 0) + 1;
      updateFields.lastActive = new Date();
      
      await updateDoc(userRef, updateFields);
    }
    
    console.log('✅ updateUserChallenge SUCCESS');

    // Verify save
    const verify = await getDoc(userChallengeRef);
    console.log('🔍 Verification - Saved data:', verify.data());
    
    return true;
  } catch (error) {
    console.error('❌ updateUserChallenge ERROR:', error);
    return false;
  }
};

export const getPlayerRank = async (challengeId: string, userId: string): Promise<number | null> => {
  try {
    // First check the participation collection
    const participationsRef = collection(db, "challenges", challengeId, "participations");
    const participationsSnapshot = await getDocs(participationsRef);
    
    let userTime: number | null = null;
    const allTimes: { userId: string; time: number }[] = [];
    
    for (const doc of participationsSnapshot.docs) {
      const data = doc.data();
      const time = data.bestTime || data.time || data._score;
      if (time && time > 0) {
        allTimes.push({ userId: doc.id, time: time });
        if (doc.id === userId) {
          userTime = time;
        }
      }
    }
    
    if (!userTime) {
      // Fallback to old method
      const userChallengeRef = doc(db, 'users', userId, 'challenges', challengeId);
      const userChallengeDoc = await getDoc(userChallengeRef);
      
      if (!userChallengeDoc.exists()) return null;
      
      const userData = userChallengeDoc.data();
      if (!userData.completed) return null;
      
      userTime = userData.bestTime || userData.time;
      if (!userTime || userTime <= 0) return null;
      
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let fasterPlayersCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === userId) continue;
        
        try {
          const challengeRef = doc(db, 'users', userDoc.id, 'challenges', challengeId);
          const challengeDoc = await getDoc(challengeRef);
          
          if (challengeDoc.exists()) {
            const data = challengeDoc.data();
            if (data.completed === true) {
              const otherTime = data.bestTime || data.time;
              if (otherTime && otherTime > 0 && otherTime < userTime) {
                fasterPlayersCount++;
              }
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      return fasterPlayersCount + 1;
    }
    
    // Calculate rank from participation collection
    const fasterPlayers = allTimes.filter(t => t.time < userTime!).length;
    return fasterPlayers + 1;
    
  } catch (error) {
    console.error('Error in getPlayerRank:', error);
    return null;
  }
};

export const getTopPlayers = async (challengeId: string, limit: number = 10): Promise<any[]> => {
  try {
    // First try to get from participation collection
    const participationsRef = collection(db, "challenges", challengeId, "participations");
    const participationsSnapshot = await getDocs(participationsRef);
    
    const completions: any[] = [];
    
    for (const doc of participationsSnapshot.docs) {
      const data = doc.data();
      const completionTime = data.bestTime || data.time || data._score;
      
      if (data.completed === true && completionTime && completionTime > 0) {
        completions.push({
          userId: doc.id,
          time: completionTime,
          name: data.displayName || 'Anonymous',
          avatar: '😎'
        });
      }
    }
    
    if (completions.length > 0) {
      completions.sort((a, b) => a.time - b.time);
      return completions.slice(0, limit);
    }
    
    // Fallback to old method
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const challengeRef = doc(db, 'users', userDoc.id, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          const completionTime = data.bestTime || data.time;
          
          if (data.completed === true && completionTime && completionTime > 0) {
            const userData = userDoc.data();
            completions.push({
              userId: userDoc.id,
              time: completionTime,
              name: userData?.username || userData?.name || 'Anonymous',
              avatar: userData?.avatar || '😎'
            });
          }
        }
      } catch (err) {
        continue;
      }
    }
    
    completions.sort((a, b) => a.time - b.time);
    return completions.slice(0, limit);
  } catch (error) {
    console.error('Error getting top players:', error);
    return [];
  }
};

export const recordPuzzleCompletion = async (
  uid: string | null,
  timeInSeconds: number,
  isPerfect: boolean,
  isWeekend: boolean
) => {
  const updatedData = await LocalStorageService.recordPuzzleSolved(timeInSeconds, isPerfect, isWeekend);

  if (uid) {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        'stats.puzzlesSolved': updatedData?.stats.totalPuzzlesSolved,
        'stats.currentStreak': updatedData?.stats.currentStreak,
        'stats.totalPlayTime': updatedData?.stats.totalPlayTime,
        'stats.perfectGames': updatedData?.stats.perfectGames,
        lastActive: new Date()
      });
    } catch (error) {
      console.log('Offline: Game progress saved locally');
    }
  }

  return updatedData;
};

export const getHomePageData = async (uid: string | null) => {
  const localHomeData = await LocalStorageService.getHomePageData();
  if (!uid) return localHomeData;
  
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      const fbData = snapshot.data();
      return {
        ...localHomeData,
        username: fbData.username,
        puzzlesSolved: Math.max(localHomeData?.puzzlesSolved || 0, fbData.stats?.puzzlesSolved || 0),
        currentStreak: Math.max(localHomeData?.currentStreak || 0, fbData.stats?.currentStreak || 0)
      };
    }
  } catch (error) {
    console.log('Offline: Using local data only');
  }
  
  return localHomeData;
};

export const getStatisticsData = async (uid: string | null) => {
  return await LocalStorageService.getStatisticsData();
};

export const getChallengeLeaderboard = async (challengeId: string) => {
  try {
    const participantsRef = collection(db, "challenge_participants");
    const q = query(participantsRef, where("challengeId", "==", challengeId), where("completed", "==", true));
    const snapshot = await getDocs(q);
    
    const participants: any[] = [];
    snapshot.forEach((doc) => {
      participants.push({ id: doc.id, ...doc.data() });
    });
    
    return participants.sort((a, b) => (a.bestTime || Infinity) - (b.bestTime || Infinity));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};