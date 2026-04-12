// server.js or index.ts - UPDATED WITH UTC SUPPORT

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
// UTC Helper Functions
// =========================

/**
 * Get UTC date string in YYYY-MM-DD format
 */
function getUTCDateString(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get UTC day of year (1-366)
 */
function getUTCDayOfYear(date: Date = new Date()): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
}

/**
 * Get UTC week number (1-53)
 */
function getUTCWeekNumber(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  
  const firstDayOfYear = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (utcDate.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
  
  return weekNumber;
}

/**
 * Get deterministic file number based on UTC date
 */
function getDailyFileNumber(date: Date = new Date()): number {
  const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const dayOfYear = getUTCDayOfYear(date);
  return fileNumbers[dayOfYear % fileNumbers.length];
}

/**
 * Get deterministic file number based on UTC week
 */
function getWeeklyFileNumber(date: Date = new Date()): number {
  const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const weekNumber = getUTCWeekNumber(date);
  return fileNumbers[weekNumber % fileNumbers.length];
}

// =========================
// Helper to fetch JSON with token
// =========================
async function fetchJson<T>(url: string): Promise<T | null> {
  console.log(`🌐 Fetching URL: ${url}`);
  try {
    const headers: any = { "Accept": "application/json" };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }
    const resp = await axios.get<T>(url, { headers });
    console.log(`✅ Success! Status: ${resp.status}`);
    return resp.data;
  } catch (err: any) {
    console.error(`❌ Failed to fetch: ${url}`);
    console.error(`   Status: ${err?.response?.status}`);
    console.error(`   Message: ${err?.message}`);
    return null;
  }
}

// =========================
// Test route to check GitHub access
// =========================
app.get("/test-github", async (req, res) => {
  console.log("🧪 Testing GitHub access...");
  
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
// Get Random Puzzle
// =========================
app.get("/puzzle/:category/:size/:difficulty", async (req, res) => {
  const { category, size, difficulty } = req.params;
  console.log(`\n🎮 Puzzle endpoint called with: category=${category}, size=${size}, difficulty=${difficulty}`);
  
  try {
    const sizeNum = parseInt(size);
    const fileNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const randomFileNum = fileNumbers[Math.floor(Math.random() * fileNumbers.length)];
    
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
// Daily Challenge - USING UTC
// =========================
app.get("/daily/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  
  // Get UTC date from query parameter or use current UTC time
  let targetDate = new Date();
  if (req.query.date) {
    targetDate = new Date(req.query.date as string);
  }
  
  const utcDateString = getUTCDateString(targetDate);
  const utcDayOfYear = getUTCDayOfYear(targetDate);
  const fileNum = getDailyFileNumber(targetDate);
  
  console.log(`\n📅 Daily endpoint called with:`);
  console.log(`   Category: ${category}`);
  console.log(`   Size: ${size}`);
  console.log(`   UTC Date: ${utcDateString}`);
  console.log(`   UTC Day of Year: ${utcDayOfYear}`);
  console.log(`   Selected File Number: ${fileNum}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    console.log(`📂 Attempting to fetch daily: ${url}`);
    
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      // Use UTC day of year to determine which puzzle index
      const puzzleIndex = utcDayOfYear % puzzles.length;
      console.log(`✅ Found daily puzzle! UTC Date: ${utcDateString}, Puzzle Index: ${puzzleIndex}`);
      res.json({ ...puzzles[puzzleIndex], category });
    } else {
      console.log(`❌ No daily puzzles found`);
      res.status(404).json({ 
        error: "No daily puzzle found",
        attempted_url: url,
        category,
        size,
        utcDate: utcDateString
      });
    }
  } catch (error) {
    console.error("Error in daily endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Weekly Challenge - USING UTC
// =========================
app.get("/weekly/:category/:size", async (req, res) => {
  const { category, size } = req.params;
  
  // Get UTC week from query parameter or use current UTC time
  let targetDate = new Date();
  let targetWeek: number | null = null;
  
  if (req.query.week) {
    targetWeek = parseInt(req.query.week as string);
  }
  
  const utcWeekNumber = targetWeek !== null ? targetWeek : getUTCWeekNumber(targetDate);
  const fileNum = getWeeklyFileNumber(targetDate);
  
  // If a specific week was provided, we need to create a date for that week
  // to ensure consistent puzzle selection
  let seedValue = utcWeekNumber;
  if (targetWeek !== null) {
    seedValue = targetWeek;
  }
  
  console.log(`\n📆 Weekly endpoint called with:`);
  console.log(`   Category: ${category}`);
  console.log(`   Size: ${size}`);
  console.log(`   UTC Week: ${utcWeekNumber}`);
  console.log(`   Selected File Number: ${fileNum}`);
  console.log(`   Seed Value: ${seedValue}`);
  
  try {
    const sizeNum = parseInt(size);
    const difficulty = "easy";
    
    const url = `${GITHUB_RAW_URL}/${category}/${sizeNum}/${difficulty}/${difficulty}_${sizeNum}_${fileNum}.json`;
    console.log(`📂 Attempting to fetch weekly: ${url}`);
    
    const puzzles = await fetchJson<any[]>(url);
    
    if (puzzles && puzzles.length > 0) {
      // Use UTC week number to determine which puzzle index
      const puzzleIndex = seedValue % puzzles.length;
      console.log(`✅ Found weekly puzzle! UTC Week: ${utcWeekNumber}, Puzzle Index: ${puzzleIndex}`);
      res.json({ ...puzzles[puzzleIndex], category });
    } else {
      console.log(`❌ No weekly puzzles found`);
      res.status(404).json({ 
        error: "No weekly puzzle found",
        attempted_url: url,
        category,
        size,
        utcWeek: utcWeekNumber
      });
    }
  } catch (error) {
    console.error("Error in weekly endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// Category Facts
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
// Debug endpoint to check UTC values
// =========================
app.get("/debug/utc", (req, res) => {
  const now = new Date();
  const utcDate = getUTCDateString(now);
  const utcDayOfYear = getUTCDayOfYear(now);
  const utcWeekNumber = getUTCWeekNumber(now);
  const dailyFileNum = getDailyFileNumber(now);
  const weeklyFileNum = getWeeklyFileNumber(now);
  
  res.json({
    local: {
      time: now.toString(),
      date: now.toLocaleDateString(),
      hours: now.getHours(),
      dayOfWeek: now.getDay()
    },
    utc: {
      time: now.toUTCString(),
      date: utcDate,
      dayOfYear: utcDayOfYear,
      weekNumber: utcWeekNumber,
      dailyFileNumber: dailyFileNum,
      weeklyFileNumber: weeklyFileNum
    },
    timezoneOffset: -now.getTimezoneOffset() / 60,
    message: "All challenges use UTC date/week for consistency worldwide"
  });
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
  console.log(`   GET http://localhost:${PORT}/test-github`);
  console.log(`   GET http://localhost:${PORT}/debug/utc (DEBUG UTC VALUES)`);
  console.log(`   GET http://localhost:${PORT}/puzzle/:category/:size/:difficulty`);
  console.log(`   GET http://localhost:${PORT}/daily/:category/:size?date=YYYY-MM-DD`);
  console.log(`   GET http://localhost:${PORT}/weekly/:category/:size?week=1-53`);
  console.log(`   GET http://localhost:${PORT}/facts/:category`);
});