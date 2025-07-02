// src/web/routes/adminRoutes.js
import express from 'express';
import { ensureAdmin } from '../middleware/authMiddleware.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import MongoBookingRepository from '../../bookings/infrastructure/MongoBookingRepository.js';

const router = express.Router();
const userRepo = new MongoUserRepository();
const accommodationRepo = new MongoAccommodationRepository();
const bookingRepo = new MongoBookingRepository();

// Utilidad para mostrar mensajes en el dashboard
function renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, message, isError = false) {
  Promise.all([
    userRepo.findAll(),
    accommodationRepo.findAll(),
    bookingRepo.findAll()
  ]).then(([users, accommodations, bookings]) => {
    res.render('adminDashboard', {
      users,
      accommodations,
      bookings,
      message,
      isError
    });
  }).catch(err => {
    res.status(500).send('Error al cargar el panel de administración');
  });
}

router.get('/admin/dashboard', ensureAdmin, async (req, res) => {
  renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, null);
});

// Cambiar rol a host
router.post('/admin/users/:id/make-host', ensureAdmin, async (req, res) => {
  try {
    await userRepo.updateUser(req.params.id, { role: 'host' });
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Rol cambiado a host correctamente.');
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al cambiar el rol a host: ' + err.message, true);
  }
});

// Cambiar rol a guest
router.post('/admin/users/:id/make-guest', ensureAdmin, async (req, res) => {
  try {
    await userRepo.updateUser(req.params.id, { role: 'guest' });
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Rol cambiado a guest correctamente.');
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al cambiar el rol a guest: ' + err.message, true);
  }
});

// Eliminar usuario
router.post('/admin/users/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await userRepo.deleteUser(req.params.id);
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Usuario eliminado correctamente.');
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al eliminar usuario: ' + err.message, true);
  }
});

// Eliminar alojamiento
router.post('/admin/accommodations/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await accommodationRepo.deleteAccommodation(req.params.id);
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Alojamiento eliminado correctamente.');
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al eliminar alojamiento: ' + err.message, true);
  }
});

// Manejo de rutas no encontradas (404)
router.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});

export default router;