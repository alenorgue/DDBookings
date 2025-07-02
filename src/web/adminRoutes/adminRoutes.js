// src/web/routes/adminRoutes.js
import express from 'express';
import { ensureAdmin } from '../../auth/middleware/auth.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import MongoBookingRepository from '../../bookings/infrastructure/MongoBookingRepository.js';

const router = express.Router();
const userRepo = new MongoUserRepository();
const accommodationRepo = new MongoAccommodationRepository();
const bookingRepo = new MongoBookingRepository();

// Utilidad para mostrar mensajes en el dashboard
function renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, message, isError = false, user = null) {
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
      isError,
      user // <-- Pasar el usuario a la vista
    });
  }).catch(err => {
    res.status(500).send('Error al cargar el panel de administración');
  });
}

router.get('/dashboard', ensureAdmin, async (req, res) => {
  console.log('Usuario en sesión:', req.session.user); // DEBUG
  renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, null, false, req.session.user);
});

// Cambiar rol a host
router.post('/users/:id/make-host', ensureAdmin, async (req, res) => {
  try {
    await userRepo.updateUser(req.params.id, { role: 'host' });
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Rol cambiado a host correctamente.', false, req.session.user);
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al cambiar el rol a host: ' + err.message, true, req.session.user);
  }
});

// Cambiar rol a guest
router.post('/users/:id/make-guest', ensureAdmin, async (req, res) => {
  try {
    await userRepo.updateUser(req.params.id, { role: 'guest' });
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Rol cambiado a guest correctamente.', false, req.session.user);
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al cambiar el rol a guest: ' + err.message, true, req.session.user);
  }
});

// Eliminar usuario
router.post('/users/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await userRepo.deleteUser(req.params.id);
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Usuario eliminado correctamente.', false, req.session.user);
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al eliminar usuario: ' + err.message, true, req.session.user);
  }
});

// Eliminar alojamiento
router.post('/accommodations/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await accommodationRepo.deleteAccommodation(req.params.id);
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Alojamiento eliminado correctamente.', false, req.session.user);
  } catch (err) {
    renderDashboardWithMessage(res, userRepo, accommodationRepo, bookingRepo, 'Error al eliminar alojamiento: ' + err.message, true, req.session.user);
  }
});

export default router;