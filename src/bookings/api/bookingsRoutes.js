import express from 'express';
import createBookingController from '../../bookings/controllers/createBookingController.js';
import getBookingByIdController from '../../bookings/controllers/getBookingByIdController.js';

const router = express.Router();

router.post('/bookings', createBookingController);

router.get('/bookings/:id', getBookingByIdController);

// Cancelar una reserva vía API
router.post('/bookings/:id/cancel', async (req, res) => {
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
});

router.get('/bookings/guest/:guestId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.guestId);
   res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del huésped');
  }
});

router.get('/bookings/host/:hostId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);
   res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del anfitrión');
  }
});

router.get('/bookings/accommodation/:accommodationId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByAccommodationId(req.params.accommodationId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del alojamiento');
  }
});

export default router;