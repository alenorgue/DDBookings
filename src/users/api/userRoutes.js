// userRoutes.js
// Define las rutas HTTP relacionadas con los usuarios

import express from 'express';
import MongoUserRepository from '../infrastructure/MongoUserRepository.js';
import RegisterUser from '../application/RegisterUser.js';
import parser from '../../config/multerCloudinary.js';

const router = express.Router();
const userRepo = new MongoUserRepository();

// Ruta POST /api/users/register para registrar nuevos usuarios
router.post('/register', parser.single('profilePicture'), async (req, res) => {
  const { name, surName, email, password, role, createdAt, bio, phoneNumber, country, language } = req.body;
  let profilePicture = req.body.profilePicture;
  // Si se subió archivo, usar la URL de Cloudinary
  if (req.file && req.file.path) {
    profilePicture = req.file.path;
  }
  try {
    const useCase = new RegisterUser(userRepo);
    await useCase.execute({ 
      name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language 
    });
    res.redirect('/login'); // Redirige a la página de login después del registro exitoso
   // res.status(201).json({ message: 'Usuario creado', userId: result._id });
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard/:id', async (req, res) => {
  const user = await userRepo.findById(req.params.id);
  res.render('dashboard', { user });
});

router.post('/update', parser.single('profilePicture'), async (req, res) => {
  const data = req.body;
  // Si se subió nueva imagen, usar la URL de Cloudinary
  if (req.file && req.file.path) {
    data.profilePicture = req.file.path;
  }
  const updated = await userRepo.updateUser(data.userId, data); // sin cambiar email
  res.redirect(`/dashboard/${updated.id}`);
});

router.get('/check-email', async (req, res, next) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ exists: false, error: 'Email requerido' });
    const user = await userRepo.findByEmail(email);
    res.json({ exists: !!user });
  } catch (err) {
    next(err);
  }
});

// Manejo de rutas no encontradas (404)
router.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});

export default router;
