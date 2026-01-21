import express from 'express';
import cors from 'cors';
import factsRoutes from './factsRoutes';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper to fetch JSON safely
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await axios.get<T>(url);
    return resp.data;
  } catch (err) {
    console.error(`Failed to fetch URL: ${url}`, err);
    return null;
  }
}

// Compute daily and weekly index
function getDailyIndex(total: number): number {
  const start = new Date(2026, 0, 12); // Jan 12, 2026
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays % total;
}

function getWeeklyIndex(total: number): number {
  const start = new Date(2026, 0, 12); // Jan 12, 2026
  const today = new Date();
  const diffWeeks = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks % total;
}

// Map animal emojis to animal names (partial mapping)
const emojiToAnimalName: Record<string, string> = {
  "🐶": "Dog",
  "🐱": "Cat",
  "🐭": "Mouse",
  "🐰": "Rabbit",
  "🦊": "Fox",
  "🐻": "Bear",
  "🐼": "Panda",
  "🐯": "Tiger",
  "🦁": "Lion",
  "🐮": "Cow",
  "🐷": "Pig",
  "🐸": "Frog",
  "🐵": "Monkey",
  "🐔": "Chicken",
  "🦄": "Unicorn",
  "🐉": "Dragon",
  "🐴": "Horse",
  "🦒": "Giraffe",
  "🐘": "Elephant",
  "🦏": "Rhinoceros",
  "🐋": "Whale",
  "🐬": "Dolphin",
  "🦈": "Shark",
  "🐢": "Turtle",
  "🐍": "Snake",
  "🐦": "Bird",
  "🦅": "Eagle",
  "🦉": "Owl",
  "🦇": "Bat",
  "🦋": "Butterfly",
  "🐝": "Bee",
  "🐞": "Ladybug"
};

// ============================================
// ANIMALS FACTS ENDPOINT - UPDATED FOR NEW FORMAT
// ============================================
app.get('/animals/facts', async (req, res) => {
  const url = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
  
  console.log(`📚 Fetching animal facts from: ${url}`);
  
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) {
    console.log('⚠️ No animal facts found, creating fallback facts');
    
    // Create fallback animal facts in the new format
    const fallbackFacts = [
      {
        id: 1,
        name: "Dog",
        category: "mammal",
        emoji: "🐶",
        facts: [
          "Dogs have an exceptional sense of smell, up to 100,000 times more powerful than humans.",
          "Dogs can understand up to 250 words and gestures.",
          "A dog's nose print is unique, much like a human's fingerprint."
        ]
      },
      {
        id: 2,
        name: "Cat",
        category: "mammal",
        emoji: "🐱",
        facts: [
          "Cats can rotate their ears 180 degrees and have 32 muscles in each ear.",
          "Cats spend 70% of their lives sleeping.",
          "A group of cats is called a clowder."
        ]
      },
      {
        id: 3,
        name: "Rabbit",
        category: "mammal",
        emoji: "🐰",
        facts: [
          "Rabbits can see nearly 360 degrees around them without turning their heads.",
          "Rabbits can jump up to 3 feet high.",
          "A rabbit's teeth never stop growing."
        ]
      }
    ];
    
    return res.json({
      success: true,
      animals: fallbackFacts,
      total: fallbackFacts.length,
      source: 'fallback',
      message: 'GitHub facts file not available, using fallback facts'
    });
  }
  
  // Return all animals or filtered selection
  const { limit, category, search } = req.query;
  let animalsToReturn = data;
  
  // Filter by category if specified
  if (category) {
    animalsToReturn = animalsToReturn.filter(animal => 
      animal.category && animal.category.toLowerCase() === (category as string).toLowerCase()
    );
  }
  
  // Search by name if specified
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    animalsToReturn = animalsToReturn.filter(animal =>
      animal.name && animal.name.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply limit if specified
  if (limit) {
    animalsToReturn = animalsToReturn.slice(0, parseInt(limit as string));
  }
  
  console.log(`✅ Returning ${animalsToReturn.length} animals with facts`);
  
  res.json({
    success: true,
    animals: animalsToReturn,
    total: data.length,
    returned: animalsToReturn.length,
    filters: {
      category: category || 'none',
      search: search || 'none',
      limit: limit || 'none'
    },
    source: 'github'
  });
});

// Get random animal with facts
app.get('/animals/facts/random', async (req, res) => {
  const url = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
  
  console.log(`🎲 Fetching random animal facts from: ${url}`);
  
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) {
    // Fallback random animal
    const fallbackAnimals = [
      {
        id: 1,
        name: "Dog",
        category: "mammal",
        emoji: "🐶",
        facts: ["Dogs have an exceptional sense of smell, up to 100,000 times more powerful than humans."]
      },
      {
        id: 2,
        name: "Cat",
        category: "mammal",
        emoji: "🐱",
        facts: ["Cats can rotate their ears 180 degrees and have 32 muscles in each ear."]
      },
      {
        id: 3,
        name: "Fox",
        category: "mammal",
        emoji: "🦊",
        facts: ["Foxes use the Earth's magnetic field to hunt."]
      }
    ];
    
    const randomAnimal = fallbackAnimals[Math.floor(Math.random() * fallbackAnimals.length)];
    
    return res.json({
      success: true,
      animal: randomAnimal,
      source: 'fallback'
    });
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  const randomAnimal = data[randomIndex];
  
  console.log(`✅ Random animal: ${randomAnimal.name} (${randomAnimal.category})`);
  
  res.json({
    success: true,
    animal: randomAnimal,
    totalAnimals: data.length,
    index: randomIndex,
    source: 'github'
  });
});

// Get facts for specific animal by name
app.get('/animals/facts/name/:name', async (req, res) => {
  const { name } = req.params;
  const url = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
  
  console.log(`🔍 Fetching facts for animal: ${name}`);
  
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No animal facts available',
      name: name
    });
  }
  
  // Find animal by name (case-insensitive)
  const animal = data.find(a => 
    a.name && a.name.toLowerCase() === name.toLowerCase()
  );
  
  if (!animal) {
    // Try partial match
    const partialMatches = data.filter(a => 
      a.name && a.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if (partialMatches.length > 0) {
      return res.json({
        success: true,
        name: name,
        matches: partialMatches,
        count: partialMatches.length,
        note: 'Partial matches found',
        source: 'github'
      });
    }
    
    return res.status(404).json({
      success: false,
      error: `No facts found for animal: ${name}`,
      name: name,
      suggestions: data.slice(0, 10).map(a => a.name)
    });
  }
  
  console.log(`✅ Found facts for ${animal.name}`);
  
  res.json({
    success: true,
    animal: animal,
    source: 'github'
  });
});

// Get facts for animal by emoji
app.get('/animals/facts/emoji/:emoji', async (req, res) => {
  const { emoji } = req.params;
  const url = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
  
  console.log(`🔍 Fetching facts for emoji: ${emoji}`);
  
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No animal facts available',
      emoji: emoji
    });
  }
  
  // Try to find by emoji property if it exists
  let animal = data.find(a => a.emoji === emoji);
  
  // If not found by emoji property, try to match by name using our mapping
  if (!animal) {
    const animalName = emojiToAnimalName[emoji];
    if (animalName) {
      animal = data.find(a => a.name && a.name.toLowerCase() === animalName.toLowerCase());
    }
  }
  
  if (!animal) {
    return res.status(404).json({
      success: false,
      error: `No facts found for emoji: ${emoji}`,
      emoji: emoji,
      knownEmojis: Object.keys(emojiToAnimalName)
    });
  }
  
  console.log(`✅ Found facts for ${emoji} (${animal.name})`);
  
  res.json({
    success: true,
    emoji: emoji,
    animal: animal,
    source: 'github'
  });
});

// Get random fact from any animal
app.get('/animals/facts/random/fact', async (req, res) => {
  const url = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
  
  console.log(`💡 Fetching random fact from: ${url}`);
  
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) {
    // Fallback random facts
    const fallbackFacts = [
      "Dogs' noses are as unique as human fingerprints.",
      "Cats spend 70% of their lives sleeping.",
      "Rabbits can jump up to 3 feet high.",
      "Foxes can hear rodents digging underground from 100 feet away.",
      "Bears can run up to 40 miles per hour."
    ];
    
    const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
    
    return res.json({
      success: true,
      fact: randomFact,
      source: 'fallback'
    });
  }
  
  // Get random animal
  const randomAnimalIndex = Math.floor(Math.random() * data.length);
  const randomAnimal = data[randomAnimalIndex];
  
  // Get random fact from that animal
  if (!randomAnimal.facts || randomAnimal.facts.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Selected animal has no facts',
      animal: randomAnimal.name
    });
  }
  
  const randomFactIndex = Math.floor(Math.random() * randomAnimal.facts.length);
  const randomFact = randomAnimal.facts[randomFactIndex];
  
  console.log(`✅ Random fact: ${randomAnimal.name} - ${randomFact.substring(0, 50)}...`);
  
  res.json({
    success: true,
    fact: randomFact,
    animal: {
      name: randomAnimal.name,
      category: randomAnimal.category,
      emoji: randomAnimal.emoji || '🐾'
    },
    source: 'github'
  });
});

// ============================================
// EXISTING PUZZLE ENDPOINTS
// ============================================

// Daily puzzle
app.get('/animals/:size/daily', async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/${size}/daily_${size}.json`;
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) 
    return res.status(500).json({ error: 'Failed to fetch daily puzzle' });

  // Filter out incomplete entries
  const validPuzzles = data.filter(puzzle => 
    puzzle && 
    puzzle.id && 
    puzzle.puzzle && 
    puzzle.solution &&
    Array.isArray(puzzle.puzzle) &&
    Array.isArray(puzzle.solution) &&
    puzzle.puzzle.length > 0 &&
    puzzle.solution.length > 0
  );
  
  if (validPuzzles.length === 0) 
    return res.status(500).json({ error: 'No valid puzzles found' });

  const idx = getDailyIndex(validPuzzles.length);
  const selectedPuzzle = validPuzzles[idx];
  
  res.json({ 
    category: 'animals', 
    size: Number(size), 
    puzzle: selectedPuzzle,
    totalValidPuzzles: validPuzzles.length,
    dailyIndex: idx
  });
});

// Weekly puzzle
app.get('/animals/:size/weekly', async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/${size}/weekly_${size}.json`;
  const data = await fetchJson<any[]>(url);
  
  if (!data || data.length === 0) 
    return res.status(500).json({ error: 'Failed to fetch weekly puzzle' });

  const idx = getWeeklyIndex(data.length);
  res.json({ 
    category: 'animals', 
    size: Number(size), 
    puzzle: data[idx],
    weeklyIndex: idx,
    totalPuzzles: data.length
  });
});

// Sequential puzzle
app.get('/animals/:size/:difficulty/sequential', async (req, res) => {
  const { size, difficulty } = req.params;
  const indexUrl = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/${size}/${difficulty}/index.json`;
  const indexData = await fetchJson<{ files: { file: string; fromId: number; toId: number }[] }>(indexUrl);

  if (!indexData?.files || indexData.files.length === 0)
    return res.status(500).json({ error: 'Failed to fetch sequential index' });

  const fileIdx = getDailyIndex(indexData.files.length);
  const fileEntry = indexData.files[fileIdx];
  
  const fileUrl = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/${size}/${difficulty}/${fileEntry.file}`;
  const fileData = await fetchJson<any[]>(fileUrl);
  
  if (!fileData || fileData.length === 0)
    return res.status(500).json({ error: 'Failed to fetch sequential puzzle file' });

  const puzzleIdx = getDailyIndex(fileData.length);
  res.json({ 
    category: 'animals', 
    size: Number(size), 
    difficulty, 
    puzzle: fileData[puzzleIdx],
    sourceFile: fileEntry.file,
    fileIndex: fileIdx,
    puzzleIndex: puzzleIdx,
    totalFiles: indexData.files.length,
    puzzlesInFile: fileData.length
  });
});

// ============================================
// COMBINED ENDPOINT: Get puzzle with animal facts
// ============================================
app.get('/animals/:size/daily/with-facts', async (req, res) => {
  const { size } = req.params;
  
  try {
    // Get daily puzzle
    const puzzleUrl = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/${size}/daily_${size}.json`;
    const puzzleData = await fetchJson<any[]>(puzzleUrl);
    
    if (!puzzleData || puzzleData.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch daily puzzle' });
    }
    
    const idx = getDailyIndex(puzzleData.length);
    const selectedPuzzle = puzzleData[idx];
    
    // Get animal facts
    const factsUrl = 'https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json';
    const factsData = await fetchJson<any[]>(factsUrl);
    
    // Match puzzle animals with facts
    const puzzleAnimals = selectedPuzzle.contents || [];
    const animalFacts = [];
    
    if (factsData && factsData.length > 0) {
      for (const emoji of puzzleAnimals) {
        const animalName = emojiToAnimalName[emoji];
        if (animalName) {
          const animalFact = factsData.find(a => 
            a.name && a.name.toLowerCase() === animalName.toLowerCase()
          );
          if (animalFact) {
            animalFacts.push({
              emoji: emoji,
              name: animalFact.name,
              category: animalFact.category,
              fact: animalFact.facts ? animalFact.facts[0] : `Interesting facts about ${animalName}`
            });
          }
        }
      }
    }
    
    res.json({ 
      success: true,
      category: 'animals', 
      size: Number(size), 
      puzzle: selectedPuzzle,
      animalFacts: animalFacts,
      dailyIndex: idx,
      factsFound: animalFacts.length,
      totalAnimals: puzzleAnimals.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch combined data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// HEALTH CHECK AND INFO ENDPOINTS
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    endpoints: {
      // Puzzle endpoints
      daily: '/animals/:size/daily',
      weekly: '/animals/:size/weekly',
      sequential: '/animals/:size/:difficulty/sequential',
      dailyWithFacts: '/animals/:size/daily/with-facts',
      
      // Facts endpoints
      allFacts: '/animals/facts',
      randomAnimal: '/animals/facts/random',
      randomFact: '/animals/facts/random/fact',
      byName: '/animals/facts/name/:name',
      byEmoji: '/animals/facts/emoji/:emoji',
      
      // Utility
      health: '/health',
      apiInfo: '/'
    }
  });
});

// Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Zoo-Tiles API',
    version: '1.0.0',
    description: 'Sudoku-style puzzle game with animal emojis and facts',
    endpoints: [
      'GET  /health - Health check',
      'GET  /animals/:size/daily - Daily puzzle',
      'GET  /animals/:size/weekly - Weekly puzzle',
      'GET  /animals/:size/daily/with-facts - Daily puzzle with animal facts',
      'GET  /animals/facts - All animal facts (filter with ?category=&search=&limit=)',
      'GET  /animals/facts/random - Random animal with facts',
      'GET  /animals/facts/random/fact - Random fact from any animal',
      'GET  /animals/facts/name/:name - Facts by animal name',
      'GET  /animals/facts/emoji/:emoji - Facts by emoji',
      'GET  /facts/* - Additional facts routes'
    ],
    examples: [
      'http://localhost:3000/animals/16/daily',
      'http://localhost:3000/animals/16/daily/with-facts',
      'http://localhost:3000/animals/facts',
      'http://localhost:3000/animals/facts?category=mammal&limit=5',
      'http://localhost:3000/animals/facts/random',
      'http://localhost:3000/animals/facts/random/fact',
      'http://localhost:3000/animals/facts/name/Dog',
      'http://localhost:3000/animals/facts/emoji/🐶'
    ]
  });
});

// Mount facts routes (if you have separate factsRoutes file)
app.use('/facts', factsRoutes);

app.listen(PORT, () => {
  console.log(`
  🚀 Zoo-Tiles backend running on port ${PORT}
  
  🎮 Game Endpoints:
  ✅ Daily Puzzle:           http://localhost:${PORT}/animals/16/daily
  ✅ Daily with Facts:       http://localhost:${PORT}/animals/16/daily/with-facts
  ✅ Weekly Puzzle:          http://localhost:${PORT}/animals/16/weekly
  ✅ Sequential:             http://localhost:${PORT}/animals/16/easy/sequential
  
  📚 Animal Facts:
  ✅ All Animals:            http://localhost:${PORT}/animals/facts
  ✅ Filter by Category:     http://localhost:${PORT}/animals/facts?category=mammal
  ✅ Search Animals:         http://localhost:${PORT}/animals/facts?search=dog
  ✅ Random Animal:          http://localhost:${PORT}/animals/facts/random
  ✅ Random Fact:            http://localhost:${PORT}/animals/facts/random/fact
  ✅ By Name:                http://localhost:${PORT}/animals/facts/name/Dog
  ✅ By Emoji:               http://localhost:${PORT}/animals/facts/emoji/🐶
  
  🔧 Utility:
  ✅ Health Check:           http://localhost:${PORT}/health
  ✅ API Info:               http://localhost:${PORT}/
  `);
});