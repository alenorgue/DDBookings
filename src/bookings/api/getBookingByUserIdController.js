import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const bookingRepo = new MongoBookingRepository();

/**
 * Muestra todas las reservas donde el usuario actúa como huésped
 */
export default async function getBookingsByUserIdController(req, res) {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.userId);

    if (!bookings || bookings.length === 0) {
      return res.status(404).send('No se encontraron reservas para este usuario.');
    }

    res.render('bookingsUser', { bookings });
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error.message);
    res.status(500).send('Error interno del servidor');
  }
}
