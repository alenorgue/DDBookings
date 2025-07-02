// UpdateAccommodation.js
import Accommodation from '../domain/Accommodation.js';

class UpdateAccommodation {
  constructor(accommodationRepository, userRepository) {
    this.accommodationRepository = accommodationRepository;
    this.userRepository = userRepository;
  }

  async execute(id, data) {
    // Obtener el alojamiento actual
    const existingAccommodation = await this.accommodationRepository.findById(id);
    if (!existingAccommodation) {
      throw new Error('Alojamiento no encontrado');
    }
    // Reconstruir location si viene plano desde el formulario
    if (!data.location && data.country && data.city && data.address && data.postalCode) {
      data.location = {
        country: data.country,
        city: data.city,
        address: data.address,
        postalCode: data.postalCode,
        coordinates: {
          lat: data.lat !== undefined && data.lat !== '' ? Number(data.lat) : existingAccommodation.location?.coordinates?.lat,
          lng: data.lng !== undefined && data.lng !== '' ? Number(data.lng) : existingAccommodation.location?.coordinates?.lng
        }
      };
    }
    // Cast de campos numéricos solo si existen
    if (data.pricePerNight !== undefined && data.pricePerNight !== '') data.pricePerNight = Number(data.pricePerNight);
    if (data.squareMeters !== undefined && data.squareMeters !== '') data.squareMeters = Number(data.squareMeters);
    if (data.rooms !== undefined && data.rooms !== '') data.rooms = Number(data.rooms);
    if (data.beds !== undefined && data.beds !== '') data.beds = Number(data.beds);
    if (data.maxGuests !== undefined && data.maxGuests !== '') data.maxGuests = Number(data.maxGuests);
    if (data.bathrooms !== undefined && data.bathrooms !== '') data.bathrooms = Number(data.bathrooms);
    if (data.location && data.location.coordinates) {
      if (data.location.coordinates.lat !== undefined && data.location.coordinates.lat !== '') {
        data.location.coordinates.lat = Number(data.location.coordinates.lat);
      } else {
        data.location.coordinates.lat = existingAccommodation.location?.coordinates?.lat;
      }
      if (data.location.coordinates.lng !== undefined && data.location.coordinates.lng !== '') {
        data.location.coordinates.lng = Number(data.location.coordinates.lng);
      } else {
        data.location.coordinates.lng = existingAccommodation.location?.coordinates?.lng;
      }
    }
    // amenities: split si es string
    if (typeof data.amenities === 'string') {
      data.amenities = data.amenities.split(',').map(a => a.trim()).filter(Boolean);
    }
    // petsAllowed: convertir a booleano
    if (typeof data.petsAllowed === 'string') {
      data.petsAllowed = data.petsAllowed === 'true';
    }
    // mainPhoto: si no se sube nueva, usar la existente
    if (!data.mainPhoto && data.existingMainPhoto) {
      data.mainPhoto = data.existingMainPhoto;
    }
    // photos: si no se suben nuevas, usar las existentes
    if (!data.photos && data.existingPhotos) {
      data.photos = data.existingPhotos;
    }
    if (typeof data.photos === 'string') {
      try {
        data.photos = JSON.parse(data.photos);
      } catch {
        data.photos = [];
      }
    }
    if (!Array.isArray(data.photos)) {
      data.photos = [];
    }

    // Validaciones similares a CreateAccommodation (puedes refactorizar para reutilizar)
    // Aquí solo se validan los campos que se permiten actualizar
    if (data.title && (data.title.length < 5 || data.title.length > 100)) {
      throw new Error('El título debe tener entre 5 y 100 caracteres');
    }
    if (data.description && (data.description.length < 30 || data.description.length > 2000)) {
      throw new Error('La descripción debe tener entre 30 y 2000 caracteres');
    }
    
    if (typeof data.pricePerNight !== 'number' || data.pricePerNight < 10 || data.pricePerNight > 100000) {
      throw new Error('El precio por noche debe estar entre 10 y 100000');
    }

    if (!data.location || !data.location.country || !data.location.city || !data.location.address || !data.location.postalCode) {
      throw new Error('La ubicación debe incluir país, ciudad, dirección y código postal');
    }

    if (typeof data.location.country !== 'string' || data.location.country.length < 2 || data.location.country.length > 100) {
      throw new Error('El país debe ser una cadena de texto entre 2 y 100 caracteres');
    }
    if (typeof data.location.city !== 'string' || data.location.city.length < 2 || data.location.city.length > 100) {
      throw new Error('La ciudad debe ser una cadena de texto entre 2 y 100 caracteres');
    }
    if (typeof data.location.address !== 'string' || data.location.address.length < 5 || data.location.address.length > 200) {
      throw new Error('La dirección debe ser una cadena de texto entre 5 y 200 caracteres');
    }
    if (typeof data.location.postalCode !== 'string' || data.location.postalCode.length < 2 || data.location.postalCode.length > 20) {
      throw new Error('El código postal debe ser una cadena de texto entre 2 y 20 caracteres');
    }
    if (
      !data.location.coordinates ||
      typeof data.location.coordinates.lat !== 'number' ||
      typeof data.location.coordinates.lng !== 'number'
    ) {
      throw new Error('Las coordenadas del alojamiento son obligatorias y deben ser números válidos');
    }
   if (!data.mainPhoto || typeof data.mainPhoto !== 'string' || !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(data.mainPhoto)) {
      throw new Error('La foto principal debe ser una URL válida que termine en jpg, jpeg, png o webp');
    }
    if (!Array.isArray(data.photos)) {
      throw new Error('Las fotos adicionales deben ser un array');
    }

    for (const photo of data.photos) {
      if (typeof photo !== 'object' || !photo.url) {
        throw new Error('Cada foto debe ser un objeto con al menos una URL');
      }
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(photo.url)) {
        throw new Error(`URL de foto no válida: ${photo.url}`);
      }
      if (photo.label && typeof photo.label !== 'string') {
        throw new Error('La etiqueta de una foto debe ser una cadena de texto');
      }
    }

    if (!['Apartment', 'House', 'Studio', 'Loft', 'Other'].includes(data.propertyType)) {
      throw new Error('El tipo de propiedad no es válido');
    }

    if (typeof data.beds !== 'number' || data.beds < 1 || data.beds > 40) {
      throw new Error('El número de camas debe estar entre 1 y 40');
    }
    if (typeof data.maxGuests !== 'number' || data.maxGuests < 1 || data.maxGuests > 40) {
      throw new Error('El número de huéspedes debe estar entre 1 y 40');
    }
    if (typeof data.bathrooms !== 'number' || data.bathrooms < 1 || data.bathrooms > 20) {
      throw new Error('El número de baños debe estar entre 1 y 20');
    }
    if (!data.hostId) {
      throw new Error('El ID del anfitrión es obligatorio');
    }
    if (typeof data.hostId !== 'string' || data.hostId.length === 0) {
      throw new Error('El ID del anfitrión debe ser una cadena no vacía');
    }

    // Validación amenities
    const validAmenities = [
      'Adaptada para movilidad reducida', 'Wifi', 'Piscina', 'Plancha', 'Aire acondicionado', 'Calefacción', 'Cocina', 'Lavadora', 'Secadora', 'TV', 'Aparcamiento', 'Ascensor', 'Gimnasio', 'Terraza', 'Jardín', 'Cuna', 'Barbacoa', 'Chimenea', 'Lavavajillas', 'Microondas', 'Cafetera', 'Secador de pelo', 'Toallas', 'Ropa de cama', 'Otros'
    ];
    if (!Array.isArray(data.amenities)) {
      throw new Error('Amenities debe ser un array');
    }
    for (const amenity of data.amenities) {
      if (!validAmenities.includes(amenity)) {
        throw new Error(`Amenity no válido: ${amenity}`);
      }
    }

    // Validación cancellationPolicy
    const validPolicies = ['Flexible', 'Moderate', 'Strict', 'Super Strict', 'No Refund', 'Other'];
    if (!data.cancellationPolicy || !validPolicies.includes(data.cancellationPolicy)) {
      throw new Error('La política de cancelación no es válida');
    }

    // Validación checkIn y checkOut
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!data.checkIn || !timeRegex.test(data.checkIn)) {
      throw new Error('El check-in debe tener formato HH:mm (24h)');
    }
    if (!data.checkOut || !timeRegex.test(data.checkOut)) {
      throw new Error('El check-out debe tener formato HH:mm (24h)');
    }

    // Validación squareMeters
    if (typeof data.squareMeters !== 'number' || data.squareMeters < 10 || data.squareMeters > 1000) {
      throw new Error('Los metros cuadrados deben estar entre 10 y 1000');
    }

    // Validación houseRules (opcional, pero si existe, máximo 1000 caracteres)
    if (data.houseRules && data.houseRules.length > 1000) {
      throw new Error('Las reglas de la casa no pueden superar los 1000 caracteres');
    }
    //Validación sobre si el user es un host
    const user = await this.userRepository.findById(data.hostId);
    if (!user || user.role !== 'host') throw new Error('Solo los hosts pueden crear o actualizar alojamientos');

    // Solo actualizar los campos modificados
    const fieldsToUpdate = {};
    // Helper para comparar valores simples
    function isDifferent(a, b) {
      return a !== b && !(a == null && b == null);
    }
    // Helper para comparar arrays simples
    function arrayDiff(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return true;
      if (a.length !== b.length) return true;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return true;
      }
      return false;
    }
    // Comparar y asignar solo si cambia
    if (isDifferent(data.title, existingAccommodation.title)) fieldsToUpdate.title = data.title;
    if (isDifferent(data.description, existingAccommodation.description)) fieldsToUpdate.description = data.description;
    if (isDifferent(data.pricePerNight, existingAccommodation.pricePerNight)) fieldsToUpdate.pricePerNight = data.pricePerNight;
    if (isDifferent(data.squareMeters, existingAccommodation.squareMeters)) fieldsToUpdate.squareMeters = data.squareMeters;
    if (isDifferent(data.rooms, existingAccommodation.rooms)) fieldsToUpdate.rooms = data.rooms;
    if (isDifferent(data.beds, existingAccommodation.beds)) fieldsToUpdate.beds = data.beds;
    if (isDifferent(data.maxGuests, existingAccommodation.maxGuests)) fieldsToUpdate.maxGuests = data.maxGuests;
    if (isDifferent(data.bathrooms, existingAccommodation.bathrooms)) fieldsToUpdate.bathrooms = data.bathrooms;
    if (isDifferent(data.petsAllowed, existingAccommodation.petsAllowed)) fieldsToUpdate.petsAllowed = data.petsAllowed;
    if (isDifferent(data.mainPhoto, existingAccommodation.mainPhoto)) fieldsToUpdate.mainPhoto = data.mainPhoto;
    if (isDifferent(data.propertyType, existingAccommodation.propertyType)) fieldsToUpdate.propertyType = data.propertyType;
    if (isDifferent(data.houseRules, existingAccommodation.houseRules)) fieldsToUpdate.houseRules = data.houseRules;
    if (isDifferent(data.cancellationPolicy, existingAccommodation.cancellationPolicy)) fieldsToUpdate.cancellationPolicy = data.cancellationPolicy;
    if (isDifferent(data.checkIn, existingAccommodation.checkIn)) fieldsToUpdate.checkIn = data.checkIn;
    if (isDifferent(data.checkOut, existingAccommodation.checkOut)) fieldsToUpdate.checkOut = data.checkOut;
    if (isDifferent(data.status, existingAccommodation.status)) fieldsToUpdate.status = data.status;
    // Comparar amenities y photos como arrays
    if (arrayDiff(data.amenities, existingAccommodation.amenities)) fieldsToUpdate.amenities = data.amenities;
    if (arrayDiff(data.photos, existingAccommodation.photos)) fieldsToUpdate.photos = data.photos;
    // Comparar location (deep)
    if (data.location) {
      const loc = existingAccommodation.location || {};
      if (isDifferent(data.location.country, loc.country)) fieldsToUpdate['location.country'] = data.location.country;
      if (isDifferent(data.location.city, loc.city)) fieldsToUpdate['location.city'] = data.location.city;
      if (isDifferent(data.location.address, loc.address)) fieldsToUpdate['location.address'] = data.location.address;
      if (isDifferent(data.location.postalCode, loc.postalCode)) fieldsToUpdate['location.postalCode'] = data.location.postalCode;
      if (data.location.coordinates) {
        const coords = loc.coordinates || {};
        if (isDifferent(data.location.coordinates.lat, coords.lat)) fieldsToUpdate['location.coordinates.lat'] = data.location.coordinates.lat;
        if (isDifferent(data.location.coordinates.lng, coords.lng)) fieldsToUpdate['location.coordinates.lng'] = data.location.coordinates.lng;
      }
    }
    // Si no hay cambios, lanzar error
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No se detectaron cambios para actualizar');
    }
    // Actualizar en el repositorio solo los campos modificados
    const updated = await this.accommodationRepository.update(id, fieldsToUpdate);
    if (!updated) throw new Error('Alojamiento no encontrado o no actualizado');
    return updated;
  }
}

export default UpdateAccommodation;
