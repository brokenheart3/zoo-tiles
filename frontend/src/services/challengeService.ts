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

// Challenge names for each category and difficulty
const CHALLENGE_NAMES: Record<Difficulty, Record<ChallengeCategory, string>> = {
  easy: {
    aircraft: 'Sky Explorers',
    animals: 'Cute Critters',
    arabic: 'Arabic Basics',
    birds: 'Feathered Friends',
    bugs: 'Little Creepers',
    cars: 'Speedy Rides',
    clothing: 'Fashion Fun',
    colors: 'Rainbow World',
    cyrillic: 'Cyrillic Simple',
    devanagari: 'Devanagari Basics',
    emotions: 'Feelings Fun',
    fantasy: 'Magical Creatures',
    fish: 'Ocean Friends',
    flags: 'Flag Spotting',
    flowers: 'Garden Blooms',
    food: 'Tasty Treats',
    fruits: 'Fruit Basket',
    games: 'Play Time',
    geography: 'World Tour',
    greek: 'Greek Easy',
    hebrew: 'Hebrew Simple',
    holidays: 'Celebration Time',
    latin: 'Latin Simple',
    math: 'Number Fun',
    music: 'Melody Makers',
    numbers: 'Counting Fun',
    office: 'Workplace Fun',
    planets: 'Our Solar System',
    plants: 'Green Friends',
    roadSigns: 'Road Rules',
    science: 'Science Kids',
    shapes: 'Shape World',
    sports: 'Play Ball',
    tech: 'Gadget Fun',
    time: 'Tick Tock',
    tools: 'Tool Time',
    trains: 'Train Tracks',
    transport: 'On The Move',
    vegetables: 'Veggie Garden',
    weather: 'Sunny Days'
  },
  medium: {
    aircraft: 'Aviation Masters',
    animals: 'Jungle Expedition',
    arabic: 'Arabic Script',
    birds: 'Bird Watchers',
    bugs: 'Insect World',
    cars: 'Sports Cars',
    clothing: 'Fashion Trends',
    colors: 'Color Theory',
    cyrillic: 'Cyrillic Mastery',
    devanagari: 'Devanagari Writing',
    emotions: 'Deep Feelings',
    fantasy: 'Legendary Beasts',
    fish: 'Deep Sea Life',
    flags: 'World Flags',
    flowers: 'Exotic Blooms',
    food: 'International Cuisine',
    fruits: 'Tropical Fruits',
    games: 'Strategy Games',
    geography: 'Continents',
    greek: 'Greek Words',
    hebrew: 'Hebrew Reading',
    holidays: 'Festivals',
    latin: 'Latin Phrases',
    math: 'Math Puzzles',
    music: 'Music Theory',
    numbers: 'Number Patterns',
    office: 'Office Skills',
    planets: 'Deep Space',
    plants: 'Botany Study',
    roadSigns: 'Road Rules Advanced',
    science: 'Science Lab',
    shapes: 'Geometry',
    sports: 'Sports Mastery',
    tech: 'Tech Innovations',
    time: 'Time Management',
    tools: 'Tool Mastery',
    trains: 'Train Systems',
    transport: 'Logistics',
    vegetables: 'Garden Harvest',
    weather: 'Climate Study'
  },
  hard: {
    aircraft: 'Flight Commander',
    animals: 'Wild Kingdom',
    arabic: 'Arabic Calligraphy',
    birds: 'Rare Species',
    bugs: 'Entomology Expert',
    cars: 'Supercar Collection',
    clothing: 'Designer Collection',
    colors: 'Color Psychology',
    cyrillic: 'Cyrillic Expert',
    devanagari: 'Devanagari Expert',
    emotions: 'Emotional Intelligence',
    fantasy: 'Epic Fantasy World',
    fish: 'Marine Biology',
    flags: 'Flag Expert',
    flowers: 'Rare Orchids',
    food: 'Gourmet Cuisine',
    fruits: 'Exotic Fruits',
    games: 'Competitive Gaming',
    geography: 'World Expert',
    greek: 'Greek Literature',
    hebrew: 'Hebrew Expert',
    holidays: 'Global Festivals',
    latin: 'Latin Literature',
    math: 'Advanced Mathematics',
    music: 'Music Composition',
    numbers: 'Number Theory',
    office: 'Corporate Expert',
    planets: 'Astronomy Deep Dive',
    plants: 'Advanced Botany',
    roadSigns: 'Traffic Engineering',
    science: 'Advanced Science',
    shapes: 'Advanced Geometry',
    sports: 'Professional Sports',
    tech: 'Tech Mastery',
    time: 'Time Theory',
    tools: 'Professional Tools',
    trains: 'Railway Systems',
    transport: 'Transportation Expert',
    vegetables: 'Heirloom Vegetables',
    weather: 'Meteorology Expert'
  },
  expert: {
    aircraft: 'Aerospace Engineering',
    animals: 'Zoology Expert',
    arabic: 'Arabic Literature',
    birds: 'Ornithology Master',
    bugs: 'Entomology Master',
    cars: 'Automotive Engineering',
    clothing: 'Fashion Design Master',
    colors: 'Chromatic Theory',
    cyrillic: 'Cyrillic Scholar',
    devanagari: 'Devanagari Scholar',
    emotions: 'Psychology Expert',
    fantasy: 'Mythology Scholar',
    fish: 'Ichthyology Master',
    flags: 'Vexillology Expert',
    flowers: 'Floral Design Master',
    food: 'Culinary Arts Master',
    fruits: 'Pomology Expert',
    games: 'Game Design Master',
    geography: 'Cartography Expert',
    greek: 'Greek Scholar',
    hebrew: 'Hebrew Scholar',
    holidays: 'Cultural Studies',
    latin: 'Latin Scholar',
    math: 'Mathematical Genius',
    music: 'Music Maestro',
    numbers: 'Number Theory Expert',
    office: 'Business Administration',
    planets: 'Astrophysics',
    plants: 'Botany Master',
    roadSigns: 'Traffic Engineering Master',
    science: 'Scientific Research',
    shapes: 'Geometric Analysis',
    sports: 'Sports Science',
    tech: 'Technology Expert',
    time: 'Chronobiology',
    tools: 'Master Craftsman',
    trains: 'Railway Engineering',
    transport: 'Logistics Master',
    vegetables: 'Olericulture Expert',
    weather: 'Climatology Expert'
  }
};

export class ChallengeService {
  private db = getFirestore();
  private challengeMetadataCache: Map<string, ChallengeMetadata> = new Map();

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

  // Get deterministic category based on date (for daily challenges) or week (for weekly)
  private getCategoryForChallenge(type: ChallengeType, date: Date): ChallengeCategory {
    const categories = Object.keys(ALL_CATEGORIES) as ChallengeCategory[];
    
    if (type === 'daily') {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % categories.length;
      return categories[index];
    } else {
      const weekNumber = this.getWeekNumber(date);
      const index = weekNumber % categories.length;
      return categories[index];
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

  private getChallengeName(difficulty: Difficulty, category: ChallengeCategory): string {
    return CHALLENGE_NAMES[difficulty]?.[category] || `${ALL_CATEGORIES[category].displayName} Challenge`;
  }

  // Get challenge metadata (name, category, icon)
  async getChallengeMetadata(
    challengeType: ChallengeType,
    gridSize: string
  ): Promise<ChallengeMetadata> {
    const challengeId = this.generateChallengeId(challengeType);
    
    // Check cache first
    if (this.challengeMetadataCache.has(challengeId)) {
      return this.challengeMetadataCache.get(challengeId)!;
    }
    
    // Try to get from Firebase
    const metadataRef = doc(this.db, 'challengeMetadata', challengeId);
    const metadataDoc = await getDoc(metadataRef);
    
    if (metadataDoc.exists()) {
      const metadata = metadataDoc.data() as ChallengeMetadata;
      this.challengeMetadataCache.set(challengeId, metadata);
      return metadata;
    }
    
    // Generate new metadata
    const difficulty = this.getDifficultyFromGridSize(gridSize);
    const category = this.getCategoryForChallenge(challengeType, new Date());
    const categoryInfo = getCategoryInfo(category);
    const name = this.getChallengeName(difficulty, category);
    
    const metadata: ChallengeMetadata = {
      challengeId,
      challengeType,
      name,
      category,
      categoryDisplayName: categoryInfo.displayName,
      icon: categoryInfo.icon,
      gridSize,
      difficulty,
      createdAt: new Date()
    };
    
    // Save to Firebase for consistency across devices
    await setDoc(metadataRef, {
      ...metadata,
      createdAt: serverTimestamp()
    });
    
    this.challengeMetadataCache.set(challengeId, metadata);
    return metadata;
  }

  // Get current challenge name with icon (for display)
  async getCurrentChallengeName(
    challengeType: ChallengeType,
    gridSize: string
  ): Promise<string> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize);
    return `${metadata.icon} ${metadata.name}`;
  }

  // Get current challenge category
  async getCurrentChallengeCategory(
    challengeType: ChallengeType,
    gridSize: string
  ): Promise<ChallengeCategory> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize);
    return metadata.category;
  }

  // Get full challenge display text for sharing
  async getChallengeDisplayText(
    challengeType: ChallengeType,
    gridSize: string
  ): Promise<string> {
    const metadata = await this.getChallengeMetadata(challengeType, gridSize);
    const typeText = challengeType === 'daily' ? 'Daily Challenge' : 'Weekly Challenge';
    return `${metadata.icon} ${metadata.name} - ${typeText} (${metadata.categoryDisplayName} Category)`;
  }

  async submitChallengeCompletion(
    userId: string,
    challengeType: ChallengeType,
    gridSize: string,
    score: number,
    displayName: string,
    photoURL?: string
  ): Promise<{ playerCount: number; challengeId: string; challengeName: string; category: string }> {
    
    const challengeId = this.generateChallengeId(challengeType);
    
    // Get challenge metadata first
    const metadata = await this.getChallengeMetadata(challengeType, gridSize);
    
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
      category: metadata.categoryDisplayName 
    };
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