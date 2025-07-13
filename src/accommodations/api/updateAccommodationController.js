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
    // Obtener siempre el alojamiento actual para conservar las fotos si no se modifican
    const accommodation = await accommodationRepo.findById(req.params.id);
    let existingPhotos = (accommodation && Array.isArray(accommodation.photos)) ? accommodation.photos : [];

    // Si se subieron nuevas fotos adicionales, fusionarlas con las existentes
    let newPhotos = [];
    if (req.files && req.files.photos && req.files.photos.length > 0) {
      const existingCount = existingPhotos.length;
      newPhotos = req.files.photos.map((f, idx) => ({
        url: f.path,
        label: req.body[`photoLabel_${existingCount+idx}`] || ''
      }));
      req.body.photos = [...existingPhotos, ...newPhotos];
    } else {
      // Actualizar solo etiquetas de fotos existentes
      req.body.photos = existingPhotos.map((photo, idx) => ({
        ...photo,
        label: req.body[`photoLabel_${idx}`] || photo.label || ''
      }));
    }
    // Reconstruir location si viene plano desde el formulario o si falta alguna propiedad
    const lat = req.body['location.lat'] !== undefined && req.body['location.lat'] !== '' ? Number(req.body['location.lat']) : (req.body.location && req.body.location.coordinates && req.body.location.coordinates.lat !== undefined ? Number(req.body.location.coordinates.lat) : undefined);
    const lng = req.body['location.lng'] !== undefined && req.body['location.lng'] !== '' ? Number(req.body['location.lng']) : (req.body.location && req.body.location.coordinates && req.body.location.coordinates.lng !== undefined ? Number(req.body.location.coordinates.lng) : undefined);

    // Validar que las coordenadas sean números válidos
    if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) {
      return res.status(400).render('error', {
        message: 'Las coordenadas del alojamiento son obligatorias y deben ser números válidos',
        error: {}
      });
    }

    req.body.location = {
      country: req.body.country || (req.body.location && req.body.location.country),
      city: req.body.city || (req.body.location && req.body.location.city),
      address: req.body.address || (req.body.location && req.body.location.address),
      postalCode: req.body.postalCode || (req.body.location && req.body.location.postalCode),
      province: req.body.province || (req.body.location && req.body.location.province),
      coordinates: { lat, lng }
    };
    // Si location ya existe, asegurar que las coordenadas sean números válidos
    if (req.body.location && req.body.location.coordinates) {
      const lat = req.body.location.coordinates.lat;
      const lng = req.body.location.coordinates.lng;
      req.body.location.coordinates.lat = lat !== undefined && lat !== '' ? Number(lat) : undefined;
      req.body.location.coordinates.lng = lng !== undefined && lng !== '' ? Number(lng) : undefined;
    }
    // Si location viene como string (por error), intentar parsear
    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
        if (req.body.location.coordinates) {
          const lat = req.body.location.coordinates.lat;
          const lng = req.body.location.coordinates.lng;
          req.body.location.coordinates.lat = lat !== undefined && lat !== '' ? Number(lat) : undefined;
          req.body.location.coordinates.lng = lng !== undefined && lng !== '' ? Number(lng) : undefined;
        }
      } catch (e) {
        // Si falla el parseo, location será ignorado y la validación backend lo rechazará
      }
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
