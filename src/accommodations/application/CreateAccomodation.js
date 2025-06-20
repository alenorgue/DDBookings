// AddAccomodation.js
// Caso de uso para registrar un nuevo usuario

import Accommodation from '../domain/Accommodation.js';

class CreateAccommodation {
  constructor(accommodationRepository) {
    this.accommodationRepository = accommodationRepository;
  }

  async execute(data) {
    //  Validaciones manuales básicas
    if (!data.title || data.title.length < 5 || data.title.length > 100) {
      throw new Error('El título debe tener entre 5 y 100 caracteres');
    }

    if (!data.description || data.description.length < 30 || data.description.length > 2000) {
      throw new Error('La descripción debe tener entre 30 y 2000 caracteres');
    }

    if (typeof data.pricePerNight !== 'number' || data.pricePerNight < 10 || data.pricePerNight > 100000) {
      throw new Error('El precio por noche debe estar entre 10 y 100000');
    }

    if (!data.location || !data.location.country || !data.location.city || !data.location.address || !data.location.postalCode) {
      throw new Error('La ubicación debe incluir país, ciudad, dirección y código postal');
    }

    if (!data.mainPhoto || !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(data.mainPhoto)) {
      throw new Error('La foto principal debe ser una URL válida que termine en jpg, jpeg, png o webp');
    }

    if (!Array.isArray(data.photos)) {
      data.photos = []; // opcional
    }

    if (!['Apartment', 'House', 'Studio', 'Loft', 'Other'].includes(data.propertyType)) {
      throw new Error('El tipo de propiedad no es válido');
    }

    if (typeof data.rooms !== 'number' || data.rooms < 1 || data.rooms > 20) {
      throw new Error('El número de habitaciones debe estar entre 1 y 20');
    }

    if (typeof data.beds !== 'number' || data.beds < 1 || data.beds > 40) {
      throw new Error('El número de camas debe estar entre 1 y 40');
    }

    if (typeof data.bathrooms !== 'number' || data.bathrooms < 1 || data.bathrooms > 20) {
      throw new Error('El número de baños debe estar entre 1 y 20');
    }

    if (typeof data.petsAllowed !== 'boolean') {
      throw new Error('El campo petsAllowed debe ser true o false');
    }
    const accommodation = new Accommodation({ ...data, id: null });
    return await this.accommodationRepository.save(accommodation);
  }
}
export default CreateAccommodation;