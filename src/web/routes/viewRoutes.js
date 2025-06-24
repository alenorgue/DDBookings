import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de alojamiento!');
});


// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', (req, res) => {
    res.render('CreateAccommodation');});

// Renderiza el formulario para registrar un nuevo usuario
router.get('/register', (req, res) => {
    res.render('RegisterUser');});

// Renderiza el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('Login');});
    
// Renderiza el dashboard del usuario
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
const userRepo = new MongoUserRepository();

router.get('/dashboard/:id', async (req, res) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado');
    res.render('dashboard', { user });
  } catch (err) {
    res.status(500).send('Error al cargar el dashboard');
  }
});

export default router;