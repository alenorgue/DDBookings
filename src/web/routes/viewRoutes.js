import express from 'express';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import amenityIcons from '../../shared/amenityIcons.js';

const router = express.Router();
const userRepo = new MongoUserRepository();

const accommodationRepo = new MongoAccommodationRepository();

router.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});
// Renderiza la página principal con todos los apartamentos
// Esta ruta se usa para mostrar la lista de alojamientos en la página principal
router.get('/accommodations', async (req, res) => {
  try {
    const accommodations = await accommodationRepo.findAll(); 
    console.log(accommodations);
     res.render('accommodationsList', { accommodations, amenityIcons });
  } catch (err) {
    res.status(500).send('Error al cargar los alojamientos');
  }
});
// Renderiza la página de detalles de un alojamiento específico
router.get('/accommodations/:id', async (req, res) => {
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');
    res.render('accommodationsDetails', { accommodation, amenityIcons,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY });  
  } catch (err) {
    res.status(500).send('Error al cargar el alojamiento');
  }
});

// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', (req, res) => {
    res.render('CreateAccommodation', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
  });});

// Renderiza el formulario para registrar un nuevo usuario
router.get('/register', (req, res) => {
    res.render('RegisterUser');});

// Renderiza el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('Login');});
    
// Renderiza el dashboard del usuario


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