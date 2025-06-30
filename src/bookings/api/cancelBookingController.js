import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';

const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

export default async function cancelBookingController(req, res) {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });
    // Solo el usuario dueño de la reserva puede cancelar
    if (!req.session.user || booking.guestId.toString() !== req.session.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    // Cambiar estado
    const updated = await bookingRepo.updateStatus(req.params.id, 'cancelled');
    // Restaurar availability
    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (accommodation && Array.isArray(accommodation.availability)) {
      // Generar array de fechas a restaurar
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      let restoreDates = [];
      let current = new Date(start);
      while (current <= end) {
        restoreDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      // Añadir fechas restauradas a availability (sin duplicados)
      const newAvailability = [
        ...accommodation.availability,
        ...restoreDates
      ].map(d => (d instanceof Date ? d.toISOString().slice(0, 10) : new Date(d).toISOString().slice(0, 10)));
      // Eliminar duplicados
      const uniqueAvailability = Array.from(new Set(newAvailability)).map(d => new Date(d));
      await accommodationRepo.update(accommodation.id, { availability: uniqueAvailability });
    }
    res.redirect('/dashboard/' + req.session.user.id);
  } catch (err) {
    console.error('Error al cancelar la reserva:', err);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
}
