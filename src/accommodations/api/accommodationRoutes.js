import express from 'express';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import CreateAccommodation from '../application/CreateAccommodation.js';

const router = express.Router();

// Instanciamos el repositorio
const accommodationRepo = new MongoAccommodationRepository();

// Ruta: POST /api/accommodations
// Crea un nuevo alojamiento

router.post('/', async (req, res) => {
  try {
    const createAccommodation = new CreateAccommodation(accommodationRepo);
    const accommodation = await createAccommodation.execute(req.body);
    res.status(201).json({ message: 'Alojamiento creado', accommodation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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