// src/server.ts
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Enable CORS for web frontend
app.use(cors());

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

// =========================
// Helper to fetch JSON from GitHub
// =========================
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await axios.get<T>(url);
    return resp.data;
  } catch (err) {
    console.error(`Failed to fetch ${url}`, err);
    return null;
  }
}

// =========================
// Daily Puzzle
// =========================
app.get('/animals/:size/daily', async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${size}/daily_${size}.json`;

  const dailyData = (await fetchJson<Puzzle[]>(url)) || [];
  if (dailyData.length === 0) return res.status(500).json({ error: 'Failed to fetch daily puzzles' });

  const today = new Date().toISOString().split('T')[0];
  const todayPuzzle = dailyData.find((p) => p.date === today) || dailyData[0];

  res.json(todayPuzzle);
});

// =========================
// Weekly Puzzle
// =========================
app.get('/animals/:size/weekly', async (req, res) => {
  const { size } = req.params;
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/main/animals/${size}/weekly_${size}.json`;

  const weeklyData = (await fetchJson<Puzzle[]>(url)) || [];
  if (weeklyData.length === 0) return res.status(500).json({ error: 'Failed to fetch weekly puzzles' });

  const today = new Date();
  const thisWeekPuzzle =
    weeklyData.find((p) => p.start_date && p.end_date && new Date(p.start_date) <= today && today <= new Date(p.end_date)) ||
    weeklyData[0];

  res.json(thisWeekPuzzle);
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
