// components/challenges/ChallengeLeaderboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  completionTime: number;
  formattedTime: string;
  rank: number;
}

const ChallengeLeaderboard = ({ challengeId }: { challengeId: string }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const formatTime = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      console.log('\n🔍 FETCHING LEADERBOARD FOR:', challengeId);

      // Get all users first
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      // Create a map of user data
      const userMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        userMap.set(doc.id, doc.data());
      });

      // Get all completed challenges
      const entries: LeaderboardEntry[] = [];
      const challengePromises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const challengeRef = doc(db, 'users', userId, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (challengeDoc.exists()) {
          const challengeData = challengeDoc.data();
          if (challengeData.completed === true) {
            const userData = userMap.get(userId);
            const completionTime = challengeData.bestTime || challengeData.time || 0;
            
            return {
              userId: userId,
              username: userData?.username || userData?.displayName || 'Anonymous',
              avatar: userData?.avatar || '👤',
              completionTime: completionTime,
              formattedTime: formatTime(completionTime),
            };
          }
        }
        return null;
      });

      const results = await Promise.all(challengePromises);
      
      // Filter and sort all entries
      const allEntries = results
        .filter(entry => entry !== null)
        .sort((a, b) => a!.completionTime - b!.completionTime)
        .map((entry, index) => ({
          ...entry!,
          rank: index + 1
        }));

      console.log(`📊 Total completions: ${allEntries.length}`);

      // Get first PAGE_SIZE entries
      const initialEntries = allEntries.slice(0, PAGE_SIZE);
      setLeaderboard(initialEntries);
      
      // Check if there are more entries
      setHasMore(allEntries.length > PAGE_SIZE);

      // Find current user's entry
      if (user) {
        const userEntry = allEntries.find(entry => entry.userId === user.uid);
        if (userEntry) {
          setUserRank(userEntry);
        }
      }

    } catch (error) {
      console.error('❌ Leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      
      // Get all users again
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const userMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        userMap.set(doc.id, doc.data());
      });

      // Get all entries again
      const entries: LeaderboardEntry[] = [];
      const challengePromises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const challengeRef = doc(db, 'users', userId, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        
        if (challengeDoc.exists()) {
          const challengeData = challengeDoc.data();
          if (challengeData.completed === true) {
            const userData = userMap.get(userId);
            const completionTime = challengeData.bestTime || challengeData.time || 0;
            
            return {
              userId: userId,
              username: userData?.username || userData?.displayName || 'Anonymous',
              avatar: userData?.avatar || '👤',
              completionTime: completionTime,
              formattedTime: formatTime(completionTime),
            };
          }
        }
        return null;
      });

      const results = await Promise.all(challengePromises);
      
      const allEntries = results
        .filter(entry => entry !== null)
        .sort((a, b) => a!.completionTime - b!.completionTime)
        .map((entry, index) => ({
          ...entry!,
          rank: index + 1
        }));

      // Get next PAGE_SIZE entries
      const startRank = leaderboard.length;
      const nextEntries = allEntries.slice(startRank, startRank + PAGE_SIZE);
      
      if (nextEntries.length > 0) {
        setLeaderboard([...leaderboard, ...nextEntries]);
        setHasMore(startRank + PAGE_SIZE < allEntries.length);
      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error('❌ Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity 
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.loadMoreText}>Load More Players</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const medal = getMedal(item.rank);
    const isCurrentUser = item.userId === user?.uid;

    return (
      <View style={[
        styles.row,
        isCurrentUser && styles.currentUserRow,
      ]}>
        <View style={styles.rankContainer}>
          {medal ? (
            <Text style={styles.medal}>{medal}</Text>
          ) : (
            <Text style={styles.rankText}>#{item.rank}</Text>
          )}
        </View>

        <Text style={styles.avatar}>{item.avatar}</Text>

        <View style={styles.userInfoContainer}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUserText,
          ]} numberOfLines={1}>
            {item.username}
            {isCurrentUser && ' (You)'}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={[
            styles.timeText,
            isCurrentUser && styles.currentUserTime,
          ]}>
            {item.formattedTime}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱️ Leaderboard</Text>
      
      {leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No completions yet</Text>
          <Text style={styles.emptySubtext}>Be the first to finish!</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsHeader}>
            <Text style={styles.statsText}>
              🏆 {leaderboard.length} Players
            </Text>
          </View>

          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={renderFooter}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
          />

          {/* Show user's rank if outside loaded list */}
          {userRank && !leaderboard.some(entry => entry.userId === user?.uid) && (
            <View style={styles.userRankContainer}>
              <Text style={styles.userRankTitle}>Your Position</Text>
              <View style={styles.userRankRow}>
                <Text style={styles.userRankText}>#{userRank.rank}</Text>
                <Text style={styles.userNameText}>{userRank.username}</Text>
                <Text style={styles.userTimeText}>{userRank.formattedTime}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsHeader: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserRow: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankContainer: {
    width: 45,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  medal: {
    fontSize: 24,
  },
  avatar: {
    fontSize: 24,
    marginRight: 10,
  },
  userInfoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentUserText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  currentUserTime: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadMoreButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userRankContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  userRankTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  userRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  userRankText: {
    width: 50,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  userNameText: {
    flex: 1,
    fontSize: 16,
  },
  userTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default ChallengeLeaderboard;