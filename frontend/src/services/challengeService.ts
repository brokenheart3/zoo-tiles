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
  ChallengeStats,
  ChallengeMetadata,
  ChallengeCategory,
  Difficulty,
  ALL_CATEGORIES,
  getCategoryInfo
} from '../types/challenge';

// Import category helpers for emoji rotation
import {
  getTodayCategoryItem,
  getWeekCategoryItem,
  getCategoryEmoji
} from '../utils/categoryHelpers';

// Challenge names for each category, difficulty, AND type (daily vs weekly)
const CHALLENGE_NAMES: Record<Difficulty, Record<ChallengeCategory, { daily: string; weekly: string }>> = {
  easy: {
    aircraft: { daily: 'Sky Explorers', weekly: 'Weekend Sky Squad' },
    animals: { daily: 'Cute Critters', weekly: 'Wildlife Week' },
    arabic: { daily: 'Arabic Basics', weekly: 'Arabic Week Challenge' },
    birds: { daily: 'Feathered Friends', weekly: 'Bird Watchers Weekly' },
    bugs: { daily: 'Little Creepers', weekly: 'Bug Hunt Week' },
    cars: { daily: 'Speedy Rides', weekly: 'Race Week' },
    clothing: { daily: 'Fashion Fun', weekly: 'Style Week' },
    colors: { daily: 'Rainbow World', weekly: 'Color Week Spectacular' },
    cyrillic: { daily: 'Cyrillic Simple', weekly: 'Cyrillic Week' },
    devanagari: { daily: 'Devanagari Basics', weekly: 'Devanagari Week' },
    emotions: { daily: 'Feelings Fun', weekly: 'Emotion Week' },
    fantasy: { daily: 'Magical Creatures', weekly: 'Fantasy Week' },
    fish: { daily: 'Ocean Friends', weekly: 'Deep Sea Week' },
    flags: { daily: 'Flag Spotting', weekly: 'World Flags Week' },
    flowers: { daily: 'Garden Blooms', weekly: 'Flower Power Week' },
    food: { daily: 'Tasty Treats', weekly: 'Foodie Week' },
    fruits: { daily: 'Fruit Basket', weekly: 'Fruit Feast Week' },
    games: { daily: 'Play Time', weekly: 'Game On Week' },
    geography: { daily: 'World Tour', weekly: 'Geo Week' },
    greek: { daily: 'Greek Easy', weekly: 'Greek Week' },
    hebrew: { daily: 'Hebrew Simple', weekly: 'Hebrew Week' },
    holidays: { daily: 'Celebration Time', weekly: 'Festival Week' },
    latin: { daily: 'Latin Simple', weekly: 'Latin Week' },
    math: { daily: 'Number Fun', weekly: 'Math Mania Week' },
    music: { daily: 'Melody Makers', weekly: 'Music Week' },
    numbers: { daily: 'Counting Fun', weekly: 'Number Crunch Week' },
    office: { daily: 'Workplace Fun', weekly: 'Office Week' },
    planets: { daily: 'Our Solar System', weekly: 'Space Week' },
    plants: { daily: 'Green Friends', weekly: 'Botany Week' },
    roadSigns: { daily: 'Road Rules', weekly: 'Road Safety Week' },
    science: { daily: 'Science Kids', weekly: 'Science Week' },
    shapes: { daily: 'Shape World', weekly: 'Shape Week' },
    sports: { daily: 'Play Ball', weekly: 'Sports Week' },
    tech: { daily: 'Gadget Fun', weekly: 'Tech Week' },
    time: { daily: 'Tick Tock', weekly: 'Time Week' },
    tools: { daily: 'Tool Time', weekly: 'Toolbox Week' },
    trains: { daily: 'Train Tracks', weekly: 'Railway Week' },
    transport: { daily: 'On The Move', weekly: 'Transport Week' },
    vegetables: { daily: 'Veggie Garden', weekly: 'Veggie Week' },
    weather: { daily: 'Sunny Days', weekly: 'Weather Week' }
  },
  medium: {
    aircraft: { daily: 'Aviation Masters', weekly: 'Aviation Week Elite' },
    animals: { daily: 'Jungle Expedition', weekly: 'Safari Week Elite' },
    arabic: { daily: 'Arabic Script', weekly: 'Arabic Week Pro' },
    birds: { daily: 'Bird Watchers', weekly: 'Ornithology Week' },
    bugs: { daily: 'Insect World', weekly: 'Entomology Week' },
    cars: { daily: 'Sports Cars', weekly: 'Supercar Week' },
    clothing: { daily: 'Fashion Trends', weekly: 'Fashion Week Elite' },
    colors: { daily: 'Color Theory', weekly: 'Chromatic Week' },
    cyrillic: { daily: 'Cyrillic Mastery', weekly: 'Cyrillic Week Pro' },
    devanagari: { daily: 'Devanagari Writing', weekly: 'Devanagari Week Pro' },
    emotions: { daily: 'Deep Feelings', weekly: 'Emotional Week Elite' },
    fantasy: { daily: 'Legendary Beasts', weekly: 'Fantasy Week Epic' },
    fish: { daily: 'Deep Sea Life', weekly: 'Marine Week Pro' },
    flags: { daily: 'World Flags', weekly: 'Flag Week Masters' },
    flowers: { daily: 'Exotic Blooms', weekly: 'Botanical Week Elite' },
    food: { daily: 'International Cuisine', weekly: 'Gourmet Week' },
    fruits: { daily: 'Tropical Fruits', weekly: 'Exotic Fruit Week' },
    games: { daily: 'Strategy Games', weekly: 'Competitive Week' },
    geography: { daily: 'Continents', weekly: 'Geography Week Elite' },
    greek: { daily: 'Greek Words', weekly: 'Greek Week Pro' },
    hebrew: { daily: 'Hebrew Reading', weekly: 'Hebrew Week Pro' },
    holidays: { daily: 'Festivals', weekly: 'Celebration Week Global' },
    latin: { daily: 'Latin Phrases', weekly: 'Latin Week Pro' },
    math: { daily: 'Math Puzzles', weekly: 'Math Week Elite' },
    music: { daily: 'Music Theory', weekly: 'Music Week Pro' },
    numbers: { daily: 'Number Patterns', weekly: 'Number Week Elite' },
    office: { daily: 'Office Skills', weekly: 'Corporate Week Pro' },
    planets: { daily: 'Deep Space', weekly: 'Astronomy Week Elite' },
    plants: { daily: 'Botany Study', weekly: 'Plant Week Pro' },
    roadSigns: { daily: 'Road Rules Advanced', weekly: 'Traffic Week Pro' },
    science: { daily: 'Science Lab', weekly: 'Science Week Elite' },
    shapes: { daily: 'Geometry', weekly: 'Shape Week Pro' },
    sports: { daily: 'Sports Mastery', weekly: 'Sports Week Elite' },
    tech: { daily: 'Tech Innovations', weekly: 'Technology Week Pro' },
    time: { daily: 'Time Management', weekly: 'Time Week Elite' },
    tools: { daily: 'Tool Mastery', weekly: 'Tool Week Pro' },
    trains: { daily: 'Train Systems', weekly: 'Railway Week Pro' },
    transport: { daily: 'Logistics', weekly: 'Transport Week Elite' },
    vegetables: { daily: 'Garden Harvest', weekly: 'Veggie Week Pro' },
    weather: { daily: 'Climate Study', weekly: 'Weather Week Elite' }
  },
  hard: {
    aircraft: { daily: 'Flight Commander', weekly: 'Aviation Week Champion' },
    animals: { daily: 'Wild Kingdom', weekly: 'Wildlife Week Master' },
    arabic: { daily: 'Arabic Calligraphy', weekly: 'Arabic Week Expert' },
    birds: { daily: 'Rare Species', weekly: 'Bird Week Legend' },
    bugs: { daily: 'Entomology Expert', weekly: 'Bug Week Master' },
    cars: { daily: 'Supercar Collection', weekly: 'Hypercar Week' },
    clothing: { daily: 'Designer Collection', weekly: 'Fashion Week Master' },
    colors: { daily: 'Color Psychology', weekly: 'Color Week Expert' },
    cyrillic: { daily: 'Cyrillic Expert', weekly: 'Cyrillic Week Master' },
    devanagari: { daily: 'Devanagari Expert', weekly: 'Devanagari Week Master' },
    emotions: { daily: 'Emotional Intelligence', weekly: 'Emotion Week Expert' },
    fantasy: { daily: 'Epic Fantasy World', weekly: 'Fantasy Week Legend' },
    fish: { daily: 'Marine Biology', weekly: 'Fish Week Master' },
    flags: { daily: 'Flag Expert', weekly: 'Flag Week Champion' },
    flowers: { daily: 'Rare Orchids', weekly: 'Flower Week Expert' },
    food: { daily: 'Gourmet Cuisine', weekly: 'Food Week Master' },
    fruits: { daily: 'Exotic Fruits', weekly: 'Fruit Week Legend' },
    games: { daily: 'Competitive Gaming', weekly: 'Game Week Champion' },
    geography: { daily: 'World Expert', weekly: 'Geo Week Master' },
    greek: { daily: 'Greek Literature', weekly: 'Greek Week Expert' },
    hebrew: { daily: 'Hebrew Expert', weekly: 'Hebrew Week Master' },
    holidays: { daily: 'Global Festivals', weekly: 'Holiday Week World' },
    latin: { daily: 'Latin Literature', weekly: 'Latin Week Expert' },
    math: { daily: 'Advanced Mathematics', weekly: 'Math Week Champion' },
    music: { daily: 'Music Composition', weekly: 'Music Week Master' },
    numbers: { daily: 'Number Theory', weekly: 'Number Week Expert' },
    office: { daily: 'Corporate Expert', weekly: 'Office Week Master' },
    planets: { daily: 'Astronomy Deep Dive', weekly: 'Space Week Champion' },
    plants: { daily: 'Advanced Botany', weekly: 'Plant Week Expert' },
    roadSigns: { daily: 'Traffic Engineering', weekly: 'Road Week Master' },
    science: { daily: 'Advanced Science', weekly: 'Science Week Champion' },
    shapes: { daily: 'Advanced Geometry', weekly: 'Shape Week Expert' },
    sports: { daily: 'Professional Sports', weekly: 'Sports Week Master' },
    tech: { daily: 'Tech Mastery', weekly: 'Tech Week Champion' },
    time: { daily: 'Time Theory', weekly: 'Time Week Expert' },
    tools: { daily: 'Professional Tools', weekly: 'Tool Week Master' },
    trains: { daily: 'Railway Systems', weekly: 'Train Week Expert' },
    transport: { daily: 'Transportation Expert', weekly: 'Transport Week Master' },
    vegetables: { daily: 'Heirloom Vegetables', weekly: 'Veggie Week Expert' },
    weather: { daily: 'Meteorology Expert', weekly: 'Weather Week Champion' }
  },
  expert: {
    aircraft: { daily: 'Aerospace Engineering', weekly: 'Aviation Week Ultimate' },
    animals: { daily: 'Zoology Expert', weekly: 'Wildlife Week Grand' },
    arabic: { daily: 'Arabic Literature', weekly: 'Arabic Week Scholar' },
    birds: { daily: 'Ornithology Master', weekly: 'Bird Week Ultimate' },
    bugs: { daily: 'Entomology Master', weekly: 'Bug Week Grand' },
    cars: { daily: 'Automotive Engineering', weekly: 'Supercar Week Ultimate' },
    clothing: { daily: 'Fashion Design Master', weekly: 'Fashion Week Ultimate' },
    colors: { daily: 'Chromatic Theory', weekly: 'Color Week Grand' },
    cyrillic: { daily: 'Cyrillic Scholar', weekly: 'Cyrillic Week Ultimate' },
    devanagari: { daily: 'Devanagari Scholar', weekly: 'Devanagari Week Ultimate' },
    emotions: { daily: 'Psychology Expert', weekly: 'Emotion Week Grand' },
    fantasy: { daily: 'Mythology Scholar', weekly: 'Fantasy Week Ultimate' },
    fish: { daily: 'Ichthyology Master', weekly: 'Fish Week Grand' },
    flags: { daily: 'Vexillology Expert', weekly: 'Flag Week Ultimate' },
    flowers: { daily: 'Floral Design Master', weekly: 'Flower Week Scholar' },
    food: { daily: 'Culinary Arts Master', weekly: 'Food Week Ultimate' },
    fruits: { daily: 'Pomology Expert', weekly: 'Fruit Week Grand' },
    games: { daily: 'Game Design Master', weekly: 'Game Week Ultimate' },
    geography: { daily: 'Cartography Expert', weekly: 'Geo Week Scholar' },
    greek: { daily: 'Greek Scholar', weekly: 'Greek Week Ultimate' },
    hebrew: { daily: 'Hebrew Scholar', weekly: 'Hebrew Week Ultimate' },
    holidays: { daily: 'Cultural Studies', weekly: 'Festival Week Grand' },
    latin: { daily: 'Latin Scholar', weekly: 'Latin Week Ultimate' },
    math: { daily: 'Mathematical Genius', weekly: 'Math Week Ultimate' },
    music: { daily: 'Music Maestro', weekly: 'Music Week Grand' },
    numbers: { daily: 'Number Theory Expert', weekly: 'Number Week Ultimate' },
    office: { daily: 'Business Administration', weekly: 'Office Week Ultimate' },
    planets: { daily: 'Astrophysics', weekly: 'Space Week Grand' },
    plants: { daily: 'Botany Master', weekly: 'Plant Week Ultimate' },
    roadSigns: { daily: 'Traffic Engineering Master', weekly: 'Road Week Ultimate' },
    science: { daily: 'Scientific Research', weekly: 'Science Week Grand' },
    shapes: { daily: 'Geometric Analysis', weekly: 'Shape Week Ultimate' },
    sports: { daily: 'Sports Science', weekly: 'Sports Week Ultimate' },
    tech: { daily: 'Technology Expert', weekly: 'Tech Week Grand' },
    time: { daily: 'Chronobiology', weekly: 'Time Week Ultimate' },
    tools: { daily: 'Master Craftsman', weekly: 'Tool Week Ultimate' },
    trains: { daily: 'Railway Engineering', weekly: 'Train Week Grand' },
    transport: { daily: 'Logistics Master', weekly: 'Transport Week Ultimate' },
    vegetables: { daily: 'Olericulture Expert', weekly: 'Veggie Week Ultimate' },
    weather: { daily: 'Climatology Expert', weekly: 'Weather Week Grand' }
  }
};

export interface ChallengeMetadataWithEmoji extends ChallengeMetadata {
  challengeEmoji: string;
}

export class ChallengeService {
  private db = getFirestore();
  private challengeMetadataCache: Map<string, ChallengeMetadataWithEmoji> = new Map();

  generateChallengeId(type: ChallengeType, category: ChallengeCategory): string {
    const now = new Date();
    
    if (type === 'daily') {
      const dateStr = now.toISOString().split('T')[0];
      return `daily-${dateStr}-${category}`;
    } else {
      const weekNumber = this.getWeekNumber(now);
      return `weekly-${weekNumber}-${category}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getDifficultyFromGridSize(gridSize: string): Difficulty {
    const size = parseInt(gridSize);
    if (size <= 16) return 'easy';
    if (size <= 36) return 'medium';
    if (size <= 64) return 'hard';
    return 'expert';
  }

  private getChallengeName(
    difficulty: Difficulty, 
    category: ChallengeCategory, 
    challengeType: ChallengeType
  ): string {
    const names = CHALLENGE_NAMES[difficulty]?.[category];
    if (!names) {
      return `${getCategoryInfo(category).displayName} Challenge`;
    }
    return challengeType === 'daily' ? names.daily : names.weekly;
  }

  /**
   * Get the appropriate emoji for a challenge based on category and type
   * For daily: returns today's rotating emoji
   * For weekly: returns this week's rotating emoji
   */
  private getChallengeEmoji(category: ChallengeCategory, challengeType: ChallengeType): string {
    try {
      // Convert ChallengeCategory to Category type for categoryHelpers
      const categoryKey = category as any;
      
      if (challengeType === 'daily') {
        const todayItem = getTodayCategoryItem(categoryKey);
        return todayItem.emoji;
      } else {
        const weekItem = getWeekCategoryItem(categoryKey);
        return weekItem.emoji;
      }
    } catch (error) {
      console.error('Error getting challenge emoji:', error);
      // Fallback to category emoji
      const categoryInfo = getCategoryInfo(category);
      return categoryInfo.icon;
    }
  }

  // Get challenge metadata (name, category, icon, and specific emoji)
  async getChallengeMetadata(
    challengeType: ChallengeType,
    gridSize: string,
    category: ChallengeCategory
  ): Promise<ChallengeMetadataWithEmoji> {
    const challengeId = this.generateChallengeId(challengeType, category);
    const cacheKey = `${challengeId}-${gridSize}`;
    
    // Check cache first
    if (this.challengeMetadataCache.has(cacheKey)) {
      return this.challengeMetadataCache.get(cacheKey)!;
    }
    
    // Generate metadata
    const difficulty = this.getDifficultyFromGridSize(gridSize);
    const categoryInfo = getCategoryInfo(category);
    const name = this.getChallengeName(difficulty, category, challengeType);
    const challengeEmoji = this.getChallengeEmoji(category, challengeType);
    
    const metadata: ChallengeMetadataWithEmoji = {
      challengeId,
      challengeType,
      name,
      category,
      categoryDisplayName: categoryInfo.displayName,
      icon: categoryInfo.icon,
      gridSize,
      difficulty,
      createdAt: new Date(),
      challengeEmoji: challengeEmoji,
    };
    
    // Cache it
    this.challengeMetadataCache.set(cacheKey, metadata);
    
    // Try to save to Firebase in background (don't await)
    try {
      const metadataRef = doc(this.db, 'challengeMetadata', challengeId);
      await setDoc(metadataRef, {
        ...metadata,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving metadata to Firebase:', error);
    }
    
    return metadata;
  }

  // Get current challenge name with emoji (for display)
  async getCurrentChallengeDisplay(
    challengeType: ChallengeType,
    gridSize: string,
    category: ChallengeCategory
  ): Promise<string> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize, category);
    return `${metadata.challengeEmoji} ${metadata.name}`;
  }

  // Get current challenge name without emoji
  async getCurrentChallengeName(
    challengeType: ChallengeType,
    gridSize: string,
    category: ChallengeCategory
  ): Promise<string> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize, category);
    return metadata.name;
  }

  // Get current challenge emoji only
  async getCurrentChallengeEmoji(
    challengeType: ChallengeType,
    gridSize: string,
    category: ChallengeCategory
  ): Promise<string> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize, category);
    return metadata.challengeEmoji;
  }

  async submitChallengeCompletion(
    userId: string,
    challengeType: ChallengeType,
    gridSize: string,
    category: ChallengeCategory,
    score: number,
    displayName: string,
    photoURL?: string
  ): Promise<{ playerCount: number; challengeId: string; challengeName: string; category: string; challengeEmoji: string }> {
    
    const challengeId = this.generateChallengeId(challengeType, category);
    
    // Get challenge metadata first
    const metadata = await this.getChallengeMetadata(challengeType, gridSize, category);
    
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
      _challengeType: challengeType,
      challengeName: metadata.name,
      category: metadata.category,
      categoryDisplayName: metadata.categoryDisplayName
    };
    
    await setDoc(participationRef, {
      ...participation,
      submittedAt: serverTimestamp()
    }, { merge: true });
    
    // Update challenge player count and metadata
    const challengeRef = doc(this.db, 'challenges', challengeId);
    await setDoc(challengeRef, {
      id: challengeId,
      type: challengeType,
      playerCount: increment(1),
      lastUpdated: serverTimestamp(),
      challengeName: metadata.name,
      challengeEmoji: metadata.challengeEmoji,
      category: metadata.category,
      categoryDisplayName: metadata.categoryDisplayName,
      icon: metadata.icon
    }, { merge: true });
    
    // Get updated player count
    const challengeDoc = await getDoc(challengeRef);
    const playerCount = challengeDoc.data()?.playerCount || 0;
    
    return { 
      playerCount, 
      challengeId, 
      challengeName: metadata.name,
      category: metadata.categoryDisplayName,
      challengeEmoji: metadata.challengeEmoji
    };
  }

  async getChallengePlayerCount(
    challengeType: ChallengeType, 
    category: ChallengeCategory
  ): Promise<number> {
    try {
      const challengeId = this.generateChallengeId(challengeType, category);
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
    category: ChallengeCategory,
    userId: string
  ): Promise<PlayerRank | null> {
    try {
      const challengeId = this.generateChallengeId(challengeType, category);
      
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
    category: ChallengeCategory,
    userId: string
  ): Promise<boolean> {
    try {
      const challengeId = this.generateChallengeId(challengeType, category);
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
    category: ChallengeCategory,
    limitCount: number = 10
  ): Promise<ChallengeParticipation[]> {
    try {
      const challengeId = this.generateChallengeId(challengeType, category);
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

  // Clear cache (useful for testing or when category changes)
  clearCache(): void {
    this.challengeMetadataCache.clear();
  }
}

export const challengeService = new ChallengeService();