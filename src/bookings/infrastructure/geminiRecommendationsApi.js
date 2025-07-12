// src/bookings/infrastructure/geminiRecommendationsApi.js
import fetch from 'node-fetch';
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

/**
 * Llama a Gemini para obtener recomendaciones culturales/turísticas para una ciudad y fechas.
 * @param {string} city
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<Array>} Array de recomendaciones estructuradas
 */
export async function getRecommendationsForCity(city, startDate, endDate) {
  const promptText = `Eres un experto asistente de viajes. El usuario ha reservado un alojamiento en la ciudad de ${city} del ${startDate} al ${endDate}. Si hay eventos, actividades o experiencias culturales/turísticas/ocio recomendadas para esas fechas, sugiérelas. Si no hay eventos o actividades específicas para esas fechas, devuelve SIEMPRE una lista de 3 a 5 lugares emblemáticos, museos, parques, monumentos o experiencias típicas que cualquier visitante debería conocer en ${city}. Responde solo con un array JSON de objetos, cada uno con las claves: nombre, tipo, descripcion. Ejemplo: [ { "nombre": "Museo del Prado", "tipo": "Museo", "descripcion": "Uno de los museos de arte más importantes del mundo." }, ... ]`;

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
  let recommendations = [];
  try {
    const text = data.candidates[0].content.parts[0].text;
    // Intentar parsear directamente
    try {
      recommendations = JSON.parse(text);
    } catch (e) {
      // Si falla, buscar el primer array JSON en el texto
      const match = text.match(/\[.*\]/s);
      if (match) {
        try {
          recommendations = JSON.parse(match[0]);
        } catch (e2) {
          recommendations = [];
        }
      }
    }
  } catch (e) {
    recommendations = [];
  }

  return recommendations;
}
