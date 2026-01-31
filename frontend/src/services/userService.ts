// src/services/userService.ts
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";

// Create a Firestore document for a new user if it doesn't exist
export const createUserIfNotExists = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      username: user.displayName || "Player",
      email: user.email,
      createdAt: new Date(),
      gridSize: "8x8",
      difficulty: "Easy",
      stats: {
        gamesPlayed: 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
      },
    });
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

// Update user's progress on a challenge
export const updateUserChallenge = async (
  uid: string,
  challengeId: string,
  completed: boolean,
  time?: number
) => {
  const challengeRef = doc(db, "users", uid, "challenges", challengeId);
  const snapshot = await getDoc(challengeRef);

  const attempts = snapshot.exists() ? snapshot.data()?.attempts + 1 : 1;

  await setDoc(challengeRef, {
    completed,
    attempts,
    bestTime: time ?? snapshot.data()?.bestTime ?? null,
  });
};
