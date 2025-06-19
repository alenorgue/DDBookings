// userRoutes.js
// Define las rutas HTTP relacionadas con los usuarios

const express = require('express');
const router = express.Router();
const MongoUserRepository = require('../infrastructure/MongoUserRepository');
const RegisterUser = require('../application/RegisterUser');

const userRepo = new MongoUserRepository();

// Ruta POST /api/users/register para registrar nuevos usuarios
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const useCase = new RegisterUser(userRepo);
    const result = await useCase.execute({ email, password, role });
    res.status(201).json({ message: 'Usuario creado', userId: result._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
