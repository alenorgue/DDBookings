import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const bookingRepo = new MongoBookingRepository();

/**
 * Obtiene todas las reservas donde el usuario es host
 * @route GET /bookings/host/:hostId
 */
export default async function getBookingsByHostController(req, res) {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);

    if (!bookings || bookings.length === 0) {
      return res.status(404).send('No se encontraron reservas como anfitrión.');
    }

    res.render('bookingsHost', { bookings });
  } catch (err) {
    console.error('Error al obtener reservas del anfitrión:', err);
    res.status(500).send('Error interno del servidor');
  }
}