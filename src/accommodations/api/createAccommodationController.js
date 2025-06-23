// createAccommodationController.js
import CreateAccommodation from '../application/CreateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { findUserById } from '../../users/infrastructure/findUserById.js';

const accommodationRepo = new MongoAccommodationRepository();

export const createAccommodationController = async (req, res) => {
  try {
    // Suponiendo que el hostId viene en req.body.hostId
    const user = await findUserById(req.body.hostId);
    if (!user || user.role !== 'host') {
      return res.status(403).json({ error: 'Solo los usuarios con rol host pueden crear alojamientos.' });
    }
    // Verifica si se ha subido una imagen
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere al menos una foto para crear un alojamiento.' });
    }
    const imageUrl = req.file?.path; // URL de Cloudinary
    const data = {
      ...req.body,
      pricePerNight: Number(req.body.pricePerNight),
      squareMeters: Number(req.body.squareMeters),
      rooms: Number(req.body.rooms),
      beds: Number(req.body.beds),
      bathrooms: Number(req.body.bathrooms),
      amenities: req.body.amenities || [],
      petsAllowed: req.body.petsAllowed === 'true',
      location: {
        address: req.body['location.address'],
        city: req.body['location.city'],
        country: req.body['location.country'],
        postalCode: req.body['location.postalCode'],
      },
      photos: imageUrl
    };
    if (!imageUrl) {
      throw new Error('Se requiere al menos una foto para crear un alojamiento.');
    }
 
    const createAccommodation = new CreateAccommodation(accommodationRepo);
    const accommodation = await createAccommodation.execute(req.body);
    res.status(201).json({ message: 'Alojamiento creado', accommodation });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
