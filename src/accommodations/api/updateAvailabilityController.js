import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { getDateRangeArray, addToAvailability } from '../utils/availabilityUtils.js';

const accommodationRepo = new MongoAccommodationRepository();

export default async function updateAvailabilityController(req, res) {
  const { startDate, endDate } = req.body;
  try {
    if (!startDate || !endDate) return res.status(400).send('Fechas requeridas');
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');
    if (accommodation.hostId !== req.session.user.id) return res.status(403).send('No autorizado');

    // Usar utilidades centralizadas
    const range = getDateRangeArray(startDate, endDate);
    const updatedAvailability = addToAvailability(accommodation.availability, range);
    await accommodationRepo.update(req.params.id, { availability: updatedAvailability });
    req.session.successMessage = 'Disponibilidad actualizada correctamente';
    res.redirect('/dashboard/' + req.session.user.id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar disponibilidad');
  }
}

