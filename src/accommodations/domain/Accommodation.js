// Accommodation.js
// Entidad del dominio Accommodation. Representa un alojamiento en el sistema.

class Accommodation {
  constructor({
    id,
    title,
    pricePerNight,
    squareMeters,
    mainPhoto,
    photos,
    description,
    location,
    rooms,
    beds,
    maxGuests,
    bathrooms,
    propertyType,
    amenities,
    petsAllowed,
    houseRules,
    cancellationPolicy,
    checkIn,
    checkOut,
    hostId,
    status
  }) {
    this.id = id;
    this.title = title;
    this.pricePerNight = pricePerNight;
    this.squareMeters = squareMeters;
    this.mainPhoto = mainPhoto;
    this.photos = photos;
    this.description = description;
    this.location = location; // { address, city, country, postalCode, coordinates }
    this.rooms = rooms;
    this.beds = beds;
    this.bathrooms = bathrooms;
    this.maxGuests = maxGuests;
    this.propertyType = propertyType;
    this.amenities = amenities;
    this.petsAllowed = petsAllowed;
    this.houseRules = houseRules;
    this.cancellationPolicy = cancellationPolicy;
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.hostId = hostId;
    this.status = status;
  }
}

export default Accommodation;
