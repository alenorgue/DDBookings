// userRoutes.js
// Define las rutas HTTP relacionadas con los usuarios

import express from 'express';
import MongoUserRepository from '../infrastructure/MongoUserRepository.js';
import RegisterUser from '../application/RegisterUser.js';

const router = express.Router();
const userRepo = new MongoUserRepository();

// Ruta POST /api/users/register para registrar nuevos usuarios
router.post('/register', async (req, res) => {
  const { name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language } = req.body;
  try {
    const useCase = new RegisterUser(userRepo);
    const result = await useCase.execute({ 
      name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language 
    });
     res.redirect(`/users/dashboard/${data.userId}`);
     console.log('Usuario registrado:', result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/dashboard/:id', async (req, res) => {
  const user = await userRepo.findById(req.params.id);
  res.render('users/dashboard', { user });
});

router.post('/update', async (req, res) => {
  const data = req.body;
  const updated = await userRepo.updateUser(data.userId, data); // sin cambiar email
  res.redirect(`/users/dashboard/${data.userId}`);
});

export default router;
