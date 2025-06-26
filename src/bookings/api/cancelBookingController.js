import bookingRepo from '../infrastructure/MongoBookingRepository.js';

export default async function cancelBookingController(req, res) {
  try {
    const updated = await bookingRepo.updateStatus(req.params.id, 'cancelled');
    if (!updated) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json({
      message: 'Reserva cancelada con éxito',
      booking: updated
    });
  } catch (err) {
    console.error('Error al cancelar la reserva:', err);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
}
