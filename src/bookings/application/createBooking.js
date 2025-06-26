import Booking from '../domain/Booking.js';
import BookingStatus from '../domain/BookingStatus.js';

/**
 * @param {Object} params - Parámetros para crear una reserva
 * @param {string} params.guestId
 * @param {string} params.hostId
 * @param {string} params.accommodationId
 * @param {Date} params.startDate
 * @param {Date} params.endDate
 * @param {number} params.guests
 * @param {Object} bookingRepository - Repositorio de reservas
 * @returns {Promise<Booking>}
 */
async function createBooking(params, bookingRepository) {
  const { guestId, hostId, accommodationId, startDate, endDate, guests } = params;

  // Validaciones básicas
  if (!guestId || !hostId || !accommodationId || !startDate || !endDate || !guests) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error('La fecha de entrada debe ser anterior a la de salida');
  }
  // 🔍 Verificar disponibilidad
  const overlapping = await bookingRepository.findOverlappingBookings(accommodationId, start, end);
  if (overlapping.length > 0) {
    throw new Error('El alojamiento no está disponible en las fechas seleccionadas');
  }

  const newBooking = new Booking({
    guestId,
    hostId,
    accommodationId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    guests,
    status: BookingStatus.CONFIRMED //vamos a asumir que la reserva se crea como confirmada poruqe no vamos a implementar la plataforma de pago en este momento
  });

  return await bookingRepository.save(newBooking);
}

export default createBooking;
