import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import { getDateRangeArray, addToAvailability } from '../../accommodations/utils/availabilityUtils.js';

const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

export default async function cancelBookingController(req, res, next) {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return next({ status: 404, message: 'Reserva no encontrada' });
    // Solo el usuario dueño de la reserva puede cancelar
    if (!req.session.user || booking.guestId.toString() !== req.session.user.id) {
      return next({ status: 403, message: 'No autorizado' });
    }
    // Cambiar estado
    const updated = await bookingRepo.updateStatus(req.params.id, 'cancelled');
    // Restaurar availability
    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (accommodation && Array.isArray(accommodation.availability)) {
      // Generar array de fechas a restaurar (YYYY-MM-DD)
      const restoreDates = getDateRangeArray(booking.startDate, booking.endDate);
      // Añadir fechas restauradas a availability (sin duplicados)
      const updatedAvailability = addToAvailability(accommodation.availability, restoreDates);
      await accommodationRepo.update(accommodation.id, { availability: updatedAvailability });
    }
    // Renderizar vista de cancelación de reserva
    // Buscar el alojamiento para mostrar detalles en la vista
    const accommodationDetails = accommodation;
    return res.render('bookingsCancellation', { user: req.session.user, booking, accommodation: accommodationDetails });
  } catch (err) {
    next(err);
  }
}
