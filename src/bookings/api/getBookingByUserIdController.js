import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const bookingRepo = new MongoBookingRepository();

/**
 * Muestra todas las reservas donde el usuario actúa como huésped
 */
export default async function getBookingsByUserIdController(req, res, next) {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.userId);

    if (!bookings || bookings.length === 0) {
      return next({ status: 404, message: 'No se encontraron reservas para este usuario.' });
    }

    res.render('bookingsUser', { bookings });
  } catch (error) {
    next(error);
  }
}
