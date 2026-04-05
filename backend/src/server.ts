import express from "express";
import axios from "axios";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, "..", ".env");
config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// =========================
// GitHub Token
// =========================
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/brokenheart3/sudoAPI/main";

console.log("🔐 GitHub Token configured:", GITHUB_TOKEN ? "Yes ✅" : "No ❌");
console.log("📡 Using GitHub Raw URL:", GITHUB_RAW_URL);

// =========================
// Helper to fetch JSON with token
// =========================
async function fetchJson<T>(url: string): Promise<T | null> {
  console.log(`🌐 Fetching URL: ${url}`);
  try {
    const headers: any = { "Accept": "application/json" };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
      console.log(`🔑 Using token: ${GITHUB_TOKEN.substring(0, 10)}...`);
    }
    const resp = await axios.get<T>(url, { headers });
    console.log(`✅ Success! Status: ${resp.status}, Data length: ${JSON.stringify(resp.data).length}`);
    return resp.data;
  } catch (err: any) {
    console.error(`❌ Failed to fetch: ${url}`);
    console.error(`   Status: ${err?.response?.status}`);
    console.error(`   Message: ${err?.message}`);
    if (err?.response?.status === 404) {
      console.error(`   File not found! Check if the path is correct.`);
    }
    if (err?.response?.status === 401) {
      console.error(`   Unauthorized! Check your GitHub token.`);
    }
    return null;
  }
}

// =========================
// Test route to check GitHub access
// =========================
app.get("/test-github", async (req, res) => {
  console.log("🧪 Testing GitHub access...");
  
  // Test with a known good file (if your repo has animals/5/easy/easy_5_1.json)
  const testUrl = `${GITHUB_RAW_URL}/animals/5/easy/easy_5_1.json`;
  const result = await fetchJson<any>(testUrl);
  
  if (result) {
    res.json({ success: true, message: "GitHub access working!", data: result });
  } else {
    res.json({ success: false, message: "GitHub access failed. Check token and file paths." });
  }
});

// =========================
// SIMPLE TEST ROUTES
// =========================
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint works!" });
});

// =========================
// Get Random Puzzle - WITH DEBUGGING
// =========================
app.get("/puzzle/:category/:size/:difficulty", async (req, res) => {
  const { category, size, difficulty } = req.params;
  console.log(`\n🎮 Puzzle endpoint called with: category=${category}, size=${size}, difficulty=${difficulty}`);
  
  try {
    const sizeNum = parseInt(size);
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const randomFileNum = fileNumbers[Math.floor(Math.random() * fileNumbers.length)];
    
    // Construct the URL exactly as it should be
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${randomFileNum}.json`;
    console.log(`📂 Attempting to fetch: ${url}`);
    
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const randomIndex = Math.floor(Math.random() * puzzles.length);
      console.log(`✅ Found puzzle! Returning index ${randomIndex}`);
      res.json({ ...puzzles[randomIndex], category });
    } else {
      console.log(`❌ No puzzles found in file`);
      res.status(404).json({ 
        error: "No puzzle found",
        attempted_url: url,
        category,
        size,
        difficulty
      });
    }
  } catch (error) {
    console.error("Error in puzzle endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Daily Challenge - WITH DEBUGGING
// =========================
app.get("/daily/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  console.log(`\n📅 Daily endpoint called with: category=${category}, size=${size}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const fileNum = fileNumbers[dayOfYear % fileNumbers.length];
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    console.log(`📂 Attempting to fetch daily: ${url}`);
    
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      const puzzleIndex = dayOfYear % puzzles.length;
      console.log(`✅ Found daily puzzle! Returning index ${puzzleIndex}`);
      res.json({ ...puzzles[puzzleIndex], category });
    } else {
      console.log(`❌ No daily puzzles found`);
      res.status(404).json({ 
        error: "No daily puzzle found",
        attempted_url: url,
        category,
        size
      });
    }
  } catch (error) {
    console.error("Error in daily endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Weekly Challenge - WITH DEBUGGING
// =========================
app.get("/weekly/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  console.log(`\n📆 Weekly endpoint called with: category=${category}, size=${size}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    const fileNum = fileNumbers[weekNumber % fileNumbers.length];
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    console.log(`📂 Attempting to fetch weekly: ${url}`);
    
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      console.log(`✅ Found weekly puzzle! Returning first puzzle`);
      res.json({ ...puzzles[0], category });
    } else {
      console.log(`❌ No weekly puzzles found`);
      res.status(404).json({ 
        error: "No weekly puzzle found",
        attempted_url: url,
        category,
        size
      });
    }
  } catch (error) {
    console.error("Error in weekly endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Category Facts - WITH DEBUGGING
// =========================
app.get("/facts/:category", async (req, res) => {
  const { category } = req.params;
  console.log(`\n📚 Facts endpoint called with: category=${category}`);
  
  try {
    const url = `${GITHUB_RAW_URL}/${category}/facts/${category}_fact.json`;
    console.log(`📂 Attempting to fetch facts: ${url}`);
    
    const facts = await fetchJson<any[]>(url);
    
    if (facts && facts.length > 0) {
      console.log(`✅ Found ${facts.length} facts for ${category}`);
      res.json(facts);
    } else {
      console.log(`❌ No facts found for ${category}`);
      res.status(404).json({ 
        error: `No facts found for ${category}`,
        attempted_url: url,
        category
      });
    }
  } catch (error) {
    console.error("Error in facts endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`\n✅ Sudoku Tiles API running at http://localhost:${PORT}`);
  console.log(`📡 GitHub Token: ${GITHUB_TOKEN ? "Yes ✅" : "No ❌"}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`   GET http://localhost:${PORT}/test`);
  console.log(`   GET http://localhost:${PORT}/test-github (TEST GITHUB ACCESS)`);
  console.log(`   GET http://localhost:${PORT}/puzzle/:category/:size/:difficulty`);
  console.log(`   GET http://localhost:${PORT}/daily/:category/:size`);
  console.log(`   GET http://localhost:${PORT}/weekly/:category/:size`);
  console.log(`   GET http://localhost:${PORT}/facts/:category`);
});