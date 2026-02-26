// src/services/userService.ts
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User } from "firebase/auth";
import LocalStorageService from "./localStorageService";

// Create a Firestore document for a new user if it doesn't exist
export const createUserIfNotExists = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  // Initialize local storage with Firebase UID
  await LocalStorageService.initialize(user.uid);

  if (!snapshot.exists()) {
    // Get local stats to initialize Firebase with
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
    // User exists in Firebase, let's sync local with Firebase
    await syncLocalWithFirebase(user.uid);
  }
};

// Function to sync local data with Firebase
export const syncLocalWithFirebase = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const firebaseData = await getDoc(userRef);
  const localData = await LocalStorageService.getData();

  if (firebaseData.exists() && localData) {
    // Merge data - take the higher values
    const fbStats = firebaseData.data().stats;
    const localStats = localData.stats;

    // Determine which stats are more recent/accurate
    const mergedStats = {
      puzzlesSolved: Math.max(fbStats.puzzlesSolved, localStats.totalPuzzlesSolved),
      currentStreak: Math.max(fbStats.currentStreak, localStats.currentStreak),
      totalPlayTime: Math.max(fbStats.totalPlayTime, localStats.totalPlayTime),
      perfectGames: Math.max(fbStats.perfectGames, localStats.perfectGames),
    };

    // Update Firebase with merged data
    await updateDoc(userRef, {
      'stats': mergedStats,
      lastSynced: new Date()
    });

    // Update local with any missing Firebase data
    if (fbStats.puzzlesSolved > localStats.totalPuzzlesSolved) {
      // Handle case where Firebase has more puzzles (user played on another device)
      console.log('Firebase has more recent data, updating local...');
    }
  }
};

// Fetch the global daily challenge
export const getDailyChallenge = async () => {
  const todayId = "daily-" + new Date().toISOString().split("T")[0];
  const challengeRef = doc(db, "challenges", todayId);
  const snapshot = await getDoc(challengeRef);

  if (snapshot.exists()) return snapshot.data();
  return null;
};

// Get user's challenge result
export const getUserChallengeResult = async (uid: string, challengeId: string) => {
  console.log('🔍 Fetching challenge result:', { uid, challengeId });
  try {
    const challengeRef = doc(db, "users", uid, "challenges", challengeId);
    const snapshot = await getDoc(challengeRef);
    
    if (snapshot.exists()) {
      console.log('✅ Challenge result found:', snapshot.data());
      return snapshot.data();
    }
    console.log('❌ No challenge result found');
    return null;
  } catch (error) {
    console.error('Error getting challenge result:', error);
    return null;
  }
};

// Get user's all challenge results
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

// Update user's progress on a challenge - UPDATED with more stats
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
  console.log('📝 updateUserChallenge called:', { 
    uid, challengeId, completed, time, moves, isPerfect, correctMoves, wrongMoves, accuracy 
  });
  
  try {
    // First, record in local storage
    if (challengeId.startsWith('daily-')) {
      await LocalStorageService.recordDailyChallenge(completed, time, completed ? 100 : 0);
    }

    // Then update Firebase
    const challengeRef = doc(db, "users", uid, "challenges", challengeId);
    console.log('📝 Firebase path:', challengeRef.path);
    
    const snapshot = await getDoc(challengeRef);

    const attempts = snapshot.exists() ? snapshot.data()?.attempts + 1 : 1;
    
    // Get existing best time or use current time
    let bestTime = time;
    if (snapshot.exists() && snapshot.data()?.bestTime) {
      bestTime = Math.min(time || Infinity, snapshot.data()?.bestTime);
    }

    const data = {
      completed,
      attempts,
      bestTime,
      time, // Store the current time as well
      moves,
      correctMoves: correctMoves || 0,
      wrongMoves: wrongMoves || 0,
      accuracy: accuracy || 0,
      isPerfect: isPerfect || false,
      completedAt: completed ? new Date().toISOString() : null,
      lastUpdated: new Date()
    };
    
    console.log('📝 Saving data to Firebase:', data);
    
    await setDoc(challengeRef, data, { merge: true });

    console.log('✅ Challenge updated successfully in Firebase');
    
    // Verify by reading it back
    const verifySnapshot = await getDoc(challengeRef);
    console.log('🔍 Verification read from Firebase:', verifySnapshot.data());
    
  } catch (error) {
    console.error('❌ Error updating challenge:', error);
  }
};

// ======================
// RELIABLE RANKING FUNCTION - USE THIS ONE
// ======================
/**
 * Get user's rank in a challenge based on best time (fastest time = rank 1)
 * @param challengeId The challenge ID (e.g., "daily-2024-01-01")
 * @param userId The user's UID
 * @returns The user's rank (1-based) or null if not found
 */
export const getPlayerRank = async (challengeId: string, userId: string): Promise<number | null> => {
  try {
    console.log(`🔍 Getting rank for user ${userId} in challenge ${challengeId}`);
    
    // 1. First, get the current user's time
    const userChallengeRef = doc(db, 'users', userId, 'challenges', challengeId);
    const userChallengeDoc = await getDoc(userChallengeRef);
    
    // Check if user has completed the challenge
    if (!userChallengeDoc.exists()) {
      console.log('❌ User has not completed this challenge');
      return null;
    }
    
    const userData = userChallengeDoc.data();
    
    // Check if user actually completed it
    if (!userData.completed) {
      console.log('❌ User has not marked challenge as completed');
      return null;
    }
    
    // Get the user's best time
    const userTime = userData.bestTime || userData.time;
    
    if (!userTime || userTime <= 0) {
      console.log('❌ User has no valid time recorded');
      return null;
    }
    
    console.log(`👤 User ${userId} time: ${userTime} seconds`);
    
    // 2. Get all users and count how many have faster times
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Total users in database: ${usersSnapshot.size}`);
    
    let fasterPlayersCount = 0;
    let totalPlayersWithCompletion = 1; // Start with 1 for current user
    
    // Store all times for debugging
    const allTimes: { id: string; time: number }[] = [];
    
    // Loop through all users
    for (const userDoc of usersSnapshot.docs) {
      // Skip the current user (we already have their data)
      if (userDoc.id === userId) continue;
      
      try {
        // Get this user's challenge data
        const challengeRef = doc(db, 'users', userDoc.id, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          
          // Check if this user completed the challenge
          if (data.completed === true) {
            const otherTime = data.bestTime || data.time;
            
            if (otherTime && otherTime > 0) {
              totalPlayersWithCompletion++;
              allTimes.push({ id: userDoc.id, time: otherTime });
              
              // If this user's time is faster (SMALLER) than current user, count them
              if (otherTime < userTime) {
                fasterPlayersCount++;
                console.log(`⚡ User ${userDoc.id} is faster: ${otherTime}s < ${userTime}s`);
              }
            }
          }
        }
      } catch (err) {
        // Skip users with errors
        console.log(`⚠️ Error checking user ${userDoc.id}:`, err);
      }
    }
    
    // Calculate rank (faster players + 1)
    const rank = fasterPlayersCount + 1;
    
    console.log('📊 All completion times:');
    // Sort all times for debugging
    allTimes.sort((a, b) => a.time - b.time);
    allTimes.forEach((t, index) => {
      console.log(`   ${index + 1}. User ${t.id}: ${t.time}s`);
    });
    console.log(`   ${rank}. CURRENT USER: ${userTime}s`);
    
    console.log(`📊 Faster players: ${fasterPlayersCount}`);
    console.log(`📊 Total completions: ${totalPlayersWithCompletion}`);
    console.log(`🏆 FINAL RANK: ${rank}`);
    
    return rank;
    
  } catch (error) {
    console.error('❌ Error in getPlayerRank:', error);
    return null;
  }
};

// Get top players for leaderboard
export const getTopPlayers = async (challengeId: string, limit: number = 10): Promise<any[]> => {
  try {
    console.log(`🔍 Getting top ${limit} players for challenge ${challengeId}`);
    
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const completions: { userId: string; time: number; name: string; avatar?: string }[] = [];
    
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
    
    // Sort by time (ascending - fastest first)
    completions.sort((a, b) => a.time - b.time);
    
    // Return top N players
    const topPlayers = completions.slice(0, limit);
    console.log(`📊 Top ${topPlayers.length} players retrieved`);
    topPlayers.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.name}: ${p.time}s`);
    });
    
    return topPlayers;
    
  } catch (error) {
    console.error('❌ Error getting top players:', error);
    return [];
  }
};

// Record puzzle completion
export const recordPuzzleCompletion = async (
  uid: string | null,
  timeInSeconds: number,
  isPerfect: boolean,
  isWeekend: boolean
) => {
  // Always save locally first
  const updatedData = await LocalStorageService.recordPuzzleSolved(
    timeInSeconds, 
    isPerfect, 
    isWeekend
  );

  // If user is logged in, sync with Firebase
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

// Get home page data
export const getHomePageData = async (uid: string | null) => {
  // Get from local storage first (fastest)
  const localHomeData = await LocalStorageService.getHomePageData();
  
  if (!uid) return localHomeData; // Guest user
  
  // If logged in, try to get fresh data from Firebase
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      const fbData = snapshot.data();
      // Merge with local data
      return {
        ...localHomeData,
        username: fbData.username,
        // Use whichever is higher
        puzzlesSolved: Math.max(localHomeData?.puzzlesSolved || 0, fbData.stats?.puzzlesSolved || 0),
        currentStreak: Math.max(localHomeData?.currentStreak || 0, fbData.stats?.currentStreak || 0)
      };
    }
  } catch (error) {
    console.log('Offline: Using local data only');
  }
  
  return localHomeData;
};

// Get statistics page data
export const getStatisticsData = async (uid: string | null) => {
  // Local data has all the detailed stats we need
  return await LocalStorageService.getStatisticsData();
};

// Get challenge leaderboard
export const getChallengeLeaderboard = async (challengeId: string) => {
  try {
    const participantsRef = collection(db, "challenge_participants");
    const q = query(
      participantsRef, 
      where("challengeId", "==", challengeId),
      where("completed", "==", true)
    );
    const snapshot = await getDocs(q);
    
    const participants: any[] = [];
    snapshot.forEach((doc) => {
      participants.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by best time (lowest first)
    return participants.sort((a, b) => (a.bestTime || Infinity) - (b.bestTime || Infinity));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};