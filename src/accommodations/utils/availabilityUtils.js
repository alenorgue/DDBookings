// src/accommodations/utils/availabilityUtils.js

/**
 * Devuelve un array de fechas (YYYY-MM-DD) entre start y end, ambos inclusive.
 */
export function getDateRangeArray(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Añade fechas a availability, evitando duplicados. Recibe arrays de strings YYYY-MM-DD.
 */
export function addToAvailability(currentAvailability, datesToAdd) {
  const set = new Set((currentAvailability || []).map(d => d instanceof Date ? d.toISOString().slice(0,10) : d));
  datesToAdd.forEach(date => set.add(date));
  return Array.from(set);
}

/**
 * Elimina fechas de availability. Recibe arrays de strings YYYY-MM-DD.
 */
export function removeFromAvailability(currentAvailability, datesToRemove) {
  const removeSet = new Set(datesToRemove);
  return (currentAvailability || []).filter(d => !removeSet.has(d instanceof Date ? d.toISOString().slice(0,10) : d));
}
