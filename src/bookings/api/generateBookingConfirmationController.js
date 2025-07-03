import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import { getDateRangeArray, addToAvailability } from '../../accommodations/utils/availabilityUtils.js';

const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();
const userRepo = new MongoUserRepository();

export const generateBookingConfirmationController = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (!accommodation) {
      return res.status(404).json({ error: 'Alojamiento no encontrado' });
    }

    const user = await userRepo.findById(booking.guestId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar PDF
    const { generateBookingPDF } = await import('../utils/pdfGenerator.js');
    // Usar un stream directamente, ya que la función espera res
    return generateBookingPDF(booking, accommodation, user, res);

    // Actualizar disponibilidad del alojamiento
    const dateRange = getDateRangeArray(booking.checkInDate, booking.checkOutDate);
    await addToAvailability(accommodation._id, dateRange);
  } catch (err) {
    next(err);
  }
}