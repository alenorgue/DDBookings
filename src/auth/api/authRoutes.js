// src/auth/api/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import LoginUser from '../../auth/application/LoginUser.js';

const router = express.Router();
const userRepo = new MongoUserRepository();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(400).render('login', { error: 'Usuario no encontrado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).render('login', { error: 'Contraseña incorrecta' });

    // Guardar usuario en sesión
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

  res.redirect(`/dashboard/${user._id}`);
} catch (err) {
  res.status(500).render('login', { error: 'Error en el servidor' });
}
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/login');
  });
});


export default router;
