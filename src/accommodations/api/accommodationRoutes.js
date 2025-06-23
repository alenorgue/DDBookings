import express from 'express';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { createAccommodationController } from './createAccommodationController.js';
import parser from '../../config/multerCloudinary.js';


const router = express.Router();

console.log('accommodationRoutes cargado');

// Instanciamos el repositorio
const accommodationRepo = new MongoAccommodationRepository();

// Elimina la ruta POST anterior y usa el controller
router.post('/', parser.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), createAccommodationController);

// También puedes usar parser.array('photos') si tienes múltiples imágenes
// Ruta: POST /api/accommodations
// Crea un nuevo alojamiento

// Ruta: GET /api/accommodations
// Devuelve todos los alojamientos
router.get('/', async (req, res) => {
  try {
    const accommodations = await accommodationRepo.findAll();
    res.status(200).json(accommodations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alojamientos' });
  }
});

// Ruta: GET /api/accommodations/:id
// Devuelve un alojamiento por ID
router.get('/:id', async (req, res) => {
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ error: 'Alojamiento no encontrado' });
    }
    res.status(200).json(accommodation);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el alojamiento' });
  }
});

export default router;