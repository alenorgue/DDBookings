import createBooking from '../../bookings/application/createBooking.js';
import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';

const bookingRepository = new MongoBookingRepository();
const accommodationRepository = new MongoAccommodationRepository();

export default async function createBookingController(req, res) {
  try {
    const {
      accommodationId,
      startDate,
      endDate,
      guests
    } = req.body;

    const guestId = req.session.user?.id;
    const hostId = req.body.hostId; // puede venir oculto en el formulario

    if (!guestId || !hostId) {
      return res.status(401).send('Usuario no autenticado o datos incompletos');
    }

    const booking = await createBooking({
      guestId,
      hostId,
      accommodationId,
      startDate,
      endDate,
      guests: parseInt(guests)
    }, bookingRepository);

    // --- Actualizar availability del alojamiento ---
    const accommodation = await accommodationRepository.findById(accommodationId);
    if (accommodation && Array.isArray(accommodation.availability)) {
      // Generar array de fechas reservadas (YYYY-MM-DD)
      const start = new Date(startDate);
      const end = new Date(endDate);
      let reservedDates = [];
      let current = new Date(start);
      while (current <= end) {
        reservedDates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
      // Filtrar availability quitando las fechas reservadas
      const newAvailability = accommodation.availability.filter(date => {
        const iso = (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10);
        return !reservedDates.includes(iso);
      });
      await accommodationRepository.update(accommodationId, { availability: newAvailability });
    }
    // --- Fin actualización availability ---

    res.redirect(`/bookings/${booking.id}`);
  } catch (error) {
    console.error('Error al crear la reserva:', error.message);
    res.status(400).render('error', { message: error.message });
  }
}
