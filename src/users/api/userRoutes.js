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
    res.status(201).json({ message: 'Usuario creado', userId: result._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
