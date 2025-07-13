// src/bookings/api/geminiRecommendations.js
import express from 'express';
import { getRecommendationsForCity } from '../infrastructure/geminiRecommendationsApi.js';

const router = express.Router();

// POST /api/bookings/recommendations
router.post('/', async (req, res) => {
  console.log('Body recibido en /bookings/recommendations:', req.body);
  // Permite tanto checkIn/checkOut como startDate/endDate
  const city = req.body.city;
  const startDate = req.body.startDate || req.body.checkIn;
  const endDate = req.body.endDate || req.body.checkOut;
  if (!city || !startDate || !endDate) {
    return res.status(400).json({ error: 'Faltan datos requeridos (ciudad y fechas).' });
  }
  try {
    const recommendations = await getRecommendationsForCity(city, startDate, endDate);
    res.json({ recommendations });
  } catch (err) {
    // Siempre responde JSON, incluso en error
    res.status(500).json({ error: 'Error al obtener recomendaciones: ' + (err.message || 'Error desconocido') });
  }
});

export default router;
