// updateAccommodationController.js
import UpdateAccommodation from '../application/UpdateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';

const accommodationRepo = new MongoAccommodationRepository();
const userRepo = new MongoUserRepository();

export const updateAccommodationController = async (req, res, next) => {
  try {
    // Si se subió una nueva foto principal, usar su URL
    if (req.files && req.files.mainPhoto && req.files.mainPhoto[0] && req.files.mainPhoto[0].path) {
      req.body.mainPhoto = req.files.mainPhoto[0].path;
    }
    // Si se subieron nuevas fotos adicionales, procesarlas como array de objetos { url }
    if (req.files && req.files.photos && req.files.photos.length > 0) {
      req.body.photos = req.files.photos.map(f => ({ url: f.path }));
    }
    const updateAccommodation = new UpdateAccommodation(accommodationRepo, userRepo);
    const updated = await updateAccommodation.execute(req.params.id, req.body);
    res.status(200).json({ message: 'Alojamiento actualizado', accommodation: updated });
  } catch (err) {
    next(err);
  }
};
