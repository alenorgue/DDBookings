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
    // Si se subieron nuevas fotos adicionales, fusionarlas con las existentes
    let newPhotos = [];
    if (req.files && req.files.photos && req.files.photos.length > 0) {

      newPhotos = req.files.photos.map(f => ({ url: f.path }));
    }
    // Obtener las fotos existentes del alojamiento
    let existingPhotos = [];
    if (newPhotos.length > 0) {
      const accommodation = await accommodationRepo.findById(req.params.id);
      if (accommodation && Array.isArray(accommodation.photos)) {
        existingPhotos = accommodation.photos;
      }
      req.body.photos = [...existingPhotos, ...newPhotos];
    }
    const updateAccommodation = new UpdateAccommodation(accommodationRepo, userRepo);
    const updated = await updateAccommodation.execute(req.params.id, req.body);
    // Flash message para mostrar en la vista de detalles
    req.session.successMessage = 'Alojamiento editado correctamente';
    res.redirect(`/accommodations/${updated.id}`);
  } catch (err) {
    next(err);
  }
};
