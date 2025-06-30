// src/auth/api/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import LoginUser from '../../auth/application/LoginUser.js';

const router = express.Router();
const userRepo = new MongoUserRepository();
const loginUser = new LoginUser(userRepo);

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser.execute(email, password);
    // Guardar usuario en sesión
    req.session.user = {
      id: user.id,
      _id: user.id, // Para compatibilidad con vistas que esperan _id
      email: user.email,
      role: user.role
    };
    console.log('user en sesión:', req.session.user);
    res.redirect(`/dashboard/${user.id}`);
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/login');
  });
});

// Manejo de rutas no encontradas (404)
router.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});

export default router;
