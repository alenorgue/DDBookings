import express from 'express';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { createAccommodationController } from './createAccommodationController.js';
import { updateAccommodationController } from './updateAccommodationController.js';
import parser from '../../config/multerCloudinary.js';
import { ensureAuthenticated } from '../../auth/middleware/auth.js';
import updateAvailabilityController from './updateAvailabilityController.js';
import geminiFilterRouter from './geminiFilter.js';

const router = express.Router();

console.log('accommodationRoutes cargado');

// Instanciamos el repositorio
const accommodationRepo = new MongoAccommodationRepository();

// Elimina la ruta POST anterior y usa el controller
router.post('/', ensureAuthenticated, parser.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), createAccommodationController);

// También puedes usar parser.array('photos') si tienes múltiples imágenes
// Ruta: POST /api/accommodations
// Crea un nuevo alojamiento

// Ruta: GET /api/accommodations
// Devuelve todos los alojamientos
router.get('/', async (req, res, next) => {
  try {
    const accommodations = await accommodationRepo.findAll();
    res.status(200).json(accommodations);
  } catch (err) {
    next(err);
  }
});

// Ruta: GET /api/accommodations/:id
// Devuelve un alojamiento por ID
router.get('/:id', async (req, res, next) => {
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ error: 'Alojamiento no encontrado' });
    }
    res.status(200).json(accommodation);
  } catch (err) {
    next(err);
  }
});

// Ruta: PUT /api/accommodations/:id
// Actualiza un alojamiento por ID
router.put('/:id', ensureAuthenticated, parser.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), updateAccommodationController);

router.post('/:id/availability', ensureAuthenticated, updateAvailabilityController);

//ruta para filtrar alojamientos con Gemini
// Esta ruta se maneja en geminiFilter.js
router.use(geminiFilterRouter);
//manejo de errores
router.use((err, req, res, next) => {
  err = err || new Error('Error interno del servidor');
  err.status = err.status || 500;
  next(err);
});        

// Manejo de rutas no encontradas (404)
router.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});



export default router;