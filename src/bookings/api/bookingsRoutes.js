import express from 'express';
import createBookingController from '../api/createBookingController.js';
import getBookingByIdController from '../api/getBookingByIdController.js';
import cancelBookingController from '../api/cancelBookingController.js';
import { ensureAuthenticated } from '../../auth/middleware/auth.js';
import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';

const router = express.Router();
const bookingRepo = new MongoBookingRepository();

router.post('/bookings', ensureAuthenticated, createBookingController);
router.get('/bookings/:id', ensureAuthenticated, getBookingByIdController);
router.post('/bookings/:id/cancel', ensureAuthenticated, cancelBookingController);

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

// Manejo de rutas no encontradas (404)
router.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});

export default router;