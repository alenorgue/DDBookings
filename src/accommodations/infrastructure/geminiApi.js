// src/accommodations/infrastructure/geminiApi.js
// Lógica para llamar a la API de Gemini (Google AI)

import fetch from 'node-fetch';
import { title } from 'process';
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

/**
 * Llama a Gemini para filtrar alojamientos según el prompt del usuario.
 * Optimizado: solo envía campos relevantes y añade ejemplo de uso.
 * @param {string} prompt - El prompt del usuario.
 * @param {Array} accommodations - Lista de alojamientos (array de objetos).
 * @returns {Promise<Array>} - Lista filtrada de alojamientos (IDs o datos).
 */
export async function filterAccommodationsWithGemini(prompt, accommodations) {
  // Solo enviar los campos relevantes para evitar límites de tokens
  const reducedAccommodations = accommodations.map(a => ({
    id: a.id,
    description: a.description,
    city: a.city,
    province: a.province,
    pricePerNight: a.pricePerNight,
    rooms: a.rooms,
    type: a.type,
    amenities: a.amenities,
    title: a.title

  }));

  
  // Ejemplo para guiar a Gemini
  const example = `Ejemplo:
Criterio: alojamiento en Madrid con piscina
Alojamientos: [
  {"id":1,"ciudad":"Madrid","provincia":"Madrid","precio":100,"habitaciones":2,"tipo":"apartamento","amenities":["piscina","wifi"]},
  {"id":2,"ciudad":"Barcelona","provincia":"Barcelona","precio":90,"habitaciones":1,"tipo":"apartamento","amenities":["wifi"]}
]
Respuesta esperada: [1]
`;

  const promptText = `${example}\nAhora filtra según este criterio y lista:\nCriterio: ${prompt}\nAlojamientos: ${JSON.stringify(reducedAccommodations)}\nRecuerda: responde solo con el array de IDs, sin explicación.`;

  const body = {
    contents: [
      { role: 'user', parts: [{ text: promptText }] }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Error al llamar a Gemini: ' + response.statusText);
  }
  const data = await response.json();
  // Gemini responde en data.candidates[0].content.parts[0].text
  let ids = [];
  try {
    const text = data.candidates[0].content.parts[0].text;
    ids = JSON.parse(text);
  } catch (e) {
    ids = [];
  }
  return ids;
}

