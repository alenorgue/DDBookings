import express from 'express';
import createBookingController from '../api/createBookingController.js';
import getBookingByIdController from '../api/getBookingByIdController.js';
import cancelBookingController from '../api/cancelBookingController.js';
import { ensureAuthenticated } from '../../auth/middleware/auth.js';
import MongoBookingRepository from '../infrastructure/MongoBookingRepository.js';
import { generateBookingConfirmationController } from './generateBookingConfirmationController.js';
import geminiRecommendationsRouter from './geminiRecommendations.js';

const router = express.Router();
const bookingRepo = new MongoBookingRepository();

// RESTful: all routes are relative to /bookings
router.post('/', ensureAuthenticated, createBookingController);
router.get('/:id', ensureAuthenticated, getBookingByIdController);
router.post('/:id/cancel', ensureAuthenticated, cancelBookingController);

router.get('/guest/:guestId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.guestId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/host/:hostId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/accommodation/:accommodationId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByAccommodationId(req.params.accommodationId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});
router.get('/:id/pdf', ensureAuthenticated, generateBookingConfirmationController);

router.use('/recommendations', geminiRecommendationsRouter);

// Manejo global de errores para bookings
router.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  if (req.accepts('html')) {
    res.status(status).render('error', { message });
  } else {
    res.status(status).json({ error: message });
  }
});

export default router;