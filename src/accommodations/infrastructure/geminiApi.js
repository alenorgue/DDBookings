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
  // Enviar todos los campos relevantes
  // Prompt reforzado con varios ejemplos y reglas estrictas
  const example = `Ejemplo 1:
Criterio: alojamiento en Madrid con piscina
Alojamientos: [
  {"id":1,"city":"Madrid","province":"Madrid","pricePerNight":100,"rooms":2,"type":"apartamento","amenities":["piscina","wifi"],"description":"Bonito piso"},
  {"id":2,"city":"Barcelona","province":"Barcelona","pricePerNight":90,"rooms":1,"type":"apartamento","amenities":["wifi"],"description":"Céntrico"}
]
Respuesta esperada: [1]

Ejemplo 2:
Criterio: alojamiento barato en Barcelona
Alojamientos: [
  {"id":1,"city":"Madrid","province":"Madrid","pricePerNight":100,"rooms":2,"type":"apartamento","amenities":["piscina","wifi"]},
  {"id":2,"city":"Barcelona","province":"Barcelona","pricePerNight":50,"rooms":1,"type":"apartamento","amenities":["wifi"]}
]
Respuesta esperada: [2]

Reglas:
- Responde solo con el array de IDs, en formato JSON puro, sin explicación ni texto extra.
- No incluyas ningún texto antes ni después del array.
- Si no hay coincidencias, responde [] (array vacío).
`;

  const promptText = `${example}\nAhora filtra según este criterio y lista:\nCriterio: ${prompt}\nAlojamientos: ${JSON.stringify(accommodations)}\nRecuerda: responde solo con el array de IDs, en formato JSON válido, sin explicación ni texto adicional.`;
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Respuesta vacía de Gemini.');
    // Extrae el primer array de la respuesta, aunque venga con texto extra
    const match = text.match(/\[.*?\]/s);
    if (!match) throw new Error('No se encontró un array en la respuesta de Gemini.');
    ids = JSON.parse(match[0]);
    if (!Array.isArray(ids)) throw new Error('La respuesta de Gemini no es un array.');
  } catch (e) {
    throw new Error('Error al parsear la respuesta de Gemini: ' + e.message + (data ? `\nRespuesta Gemini: ${JSON.stringify(data)}` : ''));
  }
  return ids;
}

