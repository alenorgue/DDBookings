// src/auth/api/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import LoginUser from '../../auth/application/LoginUser.js';

const router = express.Router();
const userRepo = new MongoUserRepository();
const loginUser = new LoginUser(userRepo);

router.post('/login', async (req, res) => {
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
    let errorMsg = err.message || 'Error en el servidor';
    res.status(400).render('login', { error: errorMsg });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/login');
  });
});


export default router;
