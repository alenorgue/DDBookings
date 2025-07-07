import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const bookingRepo = new MongoBookingRepository();

/**
 * Obtiene todas las reservas donde el usuario es host
 * @route GET /bookings/host/:hostId
 */
export default async function getBookingsByHostController(req, res, next) {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);

    if (!bookings || bookings.length === 0) {
      return next({ status: 404, message: 'No se encontraron reservas como anfitrión.' });
    }

    res.render('bookingsHost', { bookings });
  } catch (err) {
    next(err);
  }
}