// src/accommodations/api/geminiFilter.mjs
import express from 'express';
import { filterAccommodationsWithGemini } from '../infrastructure/geminiApi.js';

const router = express.Router();

// POST /api/accommodations/gemini-filter
router.post('/gemini-filter', async (req, res) => {
  const { prompt, accommodations } = req.body;
  if (!prompt || !Array.isArray(accommodations)) {
    return res.status(400).json({ error: 'Faltan datos: prompt o accommodations.' });
  }
  try {
    const ids = await filterAccommodationsWithGemini(prompt, accommodations);
    res.json({ ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
