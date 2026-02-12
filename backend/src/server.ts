import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// =========================
// Types
// =========================
interface Puzzle {
  id: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  size: number;
  difficulty: string;
  category: string;
  contents: string[];
  puzzle: string[][];
  solution: string[][];
}

interface AnimalFact {
  id: number;
  name: string;
  category: string;
  facts: string[];
}

// =========================
// Helper to fetch JSON
// =========================
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await axios.get<T>(url);
    return resp.data;
  } catch (err) {
    console.error(`Failed to fetch: ${url}`, err);
    return null;
  }
}

// =========================
// ----------------- Puzzle Logic -----------------
// =========================

// Get random puzzle from size & difficulty using index.json
async function getRandomPuzzle(size: string, difficulty: string): Promise<Puzzle | null> {
  const base = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${size}/${difficulty}`;

  const indexUrl = `${base}/index.json`;
  const index = await fetchJson<any>(indexUrl);
  if (!index) return null;

  const randomFile = index.files[Math.floor(Math.random() * index.files.length)].file;
  const fileUrl = `${base}/${randomFile}`;

  const puzzles = await fetchJson<Puzzle[]>(fileUrl);
  if (!puzzles || puzzles.length === 0) return null;

  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

// ----------------- Normal Play -----------------
app.get("/animals/:size/puzzles", async (req, res) => {
  const { size } = req.params;
  const { difficulty } = req.query as { difficulty: string };

  if (!difficulty) {
    return res.status(400).json({ error: "Difficulty is required" });
  }

  const puzzle = await getRandomPuzzle(size, difficulty);
  if (!puzzle) {
    return res.status(500).json({ error: "Could not fetch puzzle" });
  }

  res.json(puzzle);
});

// ----------------- Daily Challenge -----------------
app.get("/animals/:size/daily", async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${size}/daily_${size}.json`;

  const dailyData = await fetchJson<Puzzle[]>(url);
  if (!dailyData) return res.status(500).json({ error: "Failed to fetch daily puzzles" });

  const today = new Date().toISOString().split("T")[0];
  const todayPuzzle = dailyData.find((p) => p.date === today);

  res.json(todayPuzzle || dailyData[0]);
});

// ----------------- Weekly Challenge -----------------
app.get("/animals/:size/weekly", async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${size}/weekly_${size}.json`;

  const weeklyData = await fetchJson<Puzzle[]>(url);
  if (!weeklyData) return res.status(500).json({ error: "Failed to fetch weekly puzzles" });

  const today = new Date();
  const weeklyPuzzle = weeklyData.find(
    (p) => p.start_date && p.end_date && new Date(p.start_date) <= today && today <= new Date(p.end_date)
  );

  res.json(weeklyPuzzle || weeklyData[0]);
});

// =========================
// ----------------- Animal Facts Logic -----------------
// =========================

// Cache facts for performance
let animalFactsCache: AnimalFact[] | null = null;
async function loadAnimalFacts(): Promise<AnimalFact[]> {
  if (animalFactsCache) return animalFactsCache;

  const url =
    "https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/facts/animals_fact.json";
  animalFactsCache = await fetchJson<AnimalFact[]>(url) || [];
  return animalFactsCache;
}

// In-memory user progress tracking (replace with DB for real users)
const userProgress: Record<string, Record<number, number>> = {}; // userProgress[userId][animalId] = nextFactIndex

// ----------------- Facts Endpoint -----------------
app.get("/animals/facts", async (req, res) => {
  const { animalId, userId } = req.query as { animalId: string; userId?: string };

  if (!animalId) return res.status(400).json({ error: "animalId is required" });
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const factsData = await loadAnimalFacts();
  const animal = factsData.find((a) => a.id === parseInt(animalId));
  if (!animal) return res.status(404).json({ error: "Animal not found" });

  // Initialize user progress if first time
  if (!userProgress[userId]) userProgress[userId] = {};
  if (userProgress[userId][animal.id] == null) userProgress[userId][animal.id] = 0;

  const index = userProgress[userId][animal.id];
  const fact = animal.facts[index];

  // Increment progress (loop if at end)
  userProgress[userId][animal.id] = (index + 1) % animal.facts.length;

  res.json({
    animalId: animal.id,
    animalName: animal.name,
    factId: index,
    fact,
    totalFacts: animal.facts.length
  });
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Zoo Tiles API running at http://localhost:${PORT}`);
});


