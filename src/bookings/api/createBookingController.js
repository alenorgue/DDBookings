import createBooking from '../../bookings/application/createBooking.js';
import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const bookingRepository = new MongoBookingRepository();

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

    res.redirect(`/bookings/${booking.id}`); // o donde lo desees
    
  } catch (error) {
    console.error('Error al crear la reserva:', error.message);
    res.status(400).render('errorPage', { message: error.message });
  }
}
