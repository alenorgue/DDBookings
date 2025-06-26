import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';

const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

export default async function getBookingByIdController(req, res) {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return res.status(404).send('Reserva no encontrada');

    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');

    res.render('bookingDetails', { booking, accommodation });
  } catch (err) {
    console.error('Error al cargar la reserva:', err.message);
    res.status(500).send('Error interno al buscar la reserva');
  }
}