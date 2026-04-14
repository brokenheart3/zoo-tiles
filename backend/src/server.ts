// src/server.ts
import express from "express";
import axios from "axios";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Sudoku Tiles API is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/brokenheart3/sudoAPI/main";

console.log("🔐 GitHub Token configured:", GITHUB_TOKEN ? "Yes ✅" : "No ❌");
console.log("📡 GitHub Raw URL:", GITHUB_RAW_URL);

// Helper to fetch JSON with timeout and retry
async function fetchJson<T>(url: string, retries: number = 2): Promise<T | null> {
  console.log(`🌐 Fetching: ${url.substring(0, 100)}...`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const headers: any = { "Accept": "application/json" };
      if (GITHUB_TOKEN) {
        headers["Authorization"] = `token ${GITHUB_TOKEN}`;
      }
      const resp = await axios.get<T>(url, { 
        headers, 
        timeout: 10000 
      });
      return resp.data;
    } catch (err: any) {
      console.error(`❌ Attempt ${i + 1} failed: ${err?.response?.status || err?.message}`);
      if (i === retries - 1) return null;
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

// UTC Helper Functions
function getUTCDayOfYear(date: Date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
}

function getUTCWeekNumber(date: Date = new Date()): number {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
}

// ============================
// API ENDPOINTS
// ============================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Sudoku Tiles API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      puzzle: "/puzzle/:category/:size/:difficulty",
      daily: "/daily/:category/:size",
      weekly: "/weekly/:category/:size",
      facts: "/facts/:category",
      sizes: "/sizes",
      difficulties: "/difficulties",
      categories: "/categories"
    }
  });
});

// Get random puzzle
app.get("/puzzle/:category/:size/:difficulty", async (req, res) => {
  const { category, size, difficulty } = req.params;
  
  console.log(`🎮 Puzzle request: ${category}/${size}/${difficulty}`);
  
  try {
    const sizeNum = parseInt(size);
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const randomFileNum = fileNumbers[Math.floor(Math.random() * fileNumbers.length)];
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${randomFileNum}.json`;
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const randomIndex = Math.floor(Math.random() * puzzles.length);
      console.log(`✅ Puzzle found: ${puzzles[randomIndex]?.id}`);
      res.json({ ...puzzles[randomIndex], category });
    } else {
      console.log(`❌ No puzzle found for ${category}/${size}/${difficulty}`);
      res.status(404).json({ error: "No puzzle found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Daily challenge
app.get("/daily/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  
  console.log(`📅 Daily challenge request: ${category}/${size}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const dayOfYear = getUTCDayOfYear();
    const fileNum = fileNumbers[dayOfYear % fileNumbers.length];
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const puzzleIndex = dayOfYear % puzzles.length;
      console.log(`✅ Daily puzzle found: ${puzzles[puzzleIndex]?.id} (Day ${dayOfYear})`);
      res.json({ ...puzzles[puzzleIndex], category });
    } else {
      console.log(`❌ No daily puzzle found for ${category}/${size}`);
      res.status(404).json({ error: "No daily puzzle found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Weekly challenge
app.get("/weekly/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  
  console.log(`📆 Weekly challenge request: ${category}/${size}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const weekNumber = getUTCWeekNumber();
    const fileNum = fileNumbers[weekNumber % fileNumbers.length];
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const puzzleIndex = weekNumber % puzzles.length;
      console.log(`✅ Weekly puzzle found: ${puzzles[puzzleIndex]?.id} (Week ${weekNumber})`);
      res.json({ ...puzzles[puzzleIndex], category });
    } else {
      console.log(`❌ No weekly puzzle found for ${category}/${size}`);
      res.status(404).json({ error: "No weekly puzzle found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Category facts
app.get("/facts/:category", async (req, res) => {
  const { category } = req.params;
  
  console.log(`📚 Facts request: ${category}`);
  
  try {
    const url = `${GITHUB_RAW_URL}/${category}/facts/${category}_fact.json`;
    const facts = await fetchJson<any[]>(url);
    
    if (facts && facts.length > 0) {
      console.log(`✅ Found ${facts.length} facts for ${category}`);
      res.json(facts);
    } else {
      console.log(`❌ No facts found for ${category}`);
      res.status(404).json({ error: "No facts found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get available sizes
app.get("/sizes", (req, res) => {
  res.json({ sizes: [5, 6, 7, 8, 9, 10, 11, 12, 16] });
});

// Get available difficulties
app.get("/difficulties", (req, res) => {
  res.json({ difficulties: ["easy", "medium", "hard", "expert"] });
});

// Get available categories
app.get("/categories", async (req, res) => {
  const categories = [
    "aircraft", "animals", "arabic", "birds", "bugs", "cars", "clothing",
    "colors", "cyrillic", "devanagari", "emotions", "fantasy", "fish",
    "flags", "flowers", "food", "fruits", "games", "geography", "greek",
    "hebrew", "holidays", "latin", "math", "music", "numbers", "office",
    "planets", "plants", "roadSigns", "science", "shapes", "sports", "tech",
    "time", "tools", "trains", "transport", "vegetables", "weather"
  ];
  res.json({ categories });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n✅ Sudoku Tiles API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;