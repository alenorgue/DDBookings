import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';

const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

export default async function getBookingByIdController(req, res, next) {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return next({ status: 404, message: 'Reserva no encontrada' });

    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (!accommodation) return next({ status: 404, message: 'Alojamiento no encontrado' });

    // Si hay usuario en sesión, pásalo a la vista
    const user = req.session.user || null;
    res.render('bookings', { booking, accommodation, user });
  } catch (err) {
    next(err);
  }
}