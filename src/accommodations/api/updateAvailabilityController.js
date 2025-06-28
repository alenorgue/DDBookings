import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';

const accommodationRepo = new MongoAccommodationRepository();

export default async function updateAvailabilityController(req, res) {
  const { startDate, endDate } = req.body;
  try {
    if (!startDate || !endDate) return res.status(400).send('Fechas requeridas');
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');
    if (accommodation.hostId !== req.session.user.id) return res.status(403).send('No autorizado');

    const start = new Date(startDate);
    const end = new Date(endDate);
    let dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    accommodation.availability = Array.from(new Set([
      ...(accommodation.availability || []),
      ...dates.map(d => d.toISOString())
    ]));

    await accommodationRepo.update(req.params.id, { availability: accommodation.availability });

    res.redirect('/dashboard/' + req.session.user.id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar disponibilidad');
  }
}

