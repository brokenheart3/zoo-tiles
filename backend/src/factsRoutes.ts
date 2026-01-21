import express from 'express';
import axios from 'axios';
const router = express.Router();

// Helper fetch
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await axios.get<T>(url);
    return resp.data;
  } catch (err) {
    console.error(`Failed to fetch URL: ${url}`, err);
    return null;
  }
}

// Compute daily index
function getDailyIndex(total: number): number {
  const start = new Date(2026, 0, 12); // Jan 12, 2026
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays % total;
}

// Facts sequential
router.get('/sequential', async (_req, res) => {
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/facts/animals_fact.json`;
  const data = await fetchJson<{ id: number; name: string; facts: string[] }[]>(url);

  if (!data || data.length === 0) return res.status(500).json({ error: 'Failed to fetch facts' });

  const idx = getDailyIndex(data.length);
  const animal = data[idx];
  const factIdx = getDailyIndex(animal.facts.length);
  res.json({ category: 'animals', fact: `${animal.name}: ${animal.facts[factIdx]}` });
});

// Facts all animals
router.get('/animals', async (_req, res) => {
  const url = `https://raw.githubusercontent.com/brokenheart3/sudoAPI/refs/heads/main/animals/facts/animals_fact.json`;
  const data = await fetchJson<{ id: number; name: string; facts: string[] }[]>(url);

  if (!data || data.length === 0) return res.status(500).json({ error: 'Failed to fetch facts' });

  res.json({ category: 'animals', facts: data });
});

export default router;



