// AddAccomodation.js
// Caso de uso para registrar un nuevo usuario

const Accomodation = require('../domain/Accomodation');

class CreateAccommodation {
  constructor(accommodationRepository) {
    this.accommodationRepository = accommodationRepository;
  }

  async execute(data) {
    // Aquí podrías hacer validaciones adicionales si quieres
    if (!data.title || !data.pricePerNight || !data.hostId) {
      throw new Error('Faltan datos obligatorios para crear el alojamiento');
    }
    const accommodation = new Accommodation({ ...data, id: null });
    return await this.accommodationRepository.save(accommodation);
  }
}
module.exports = CreateAccommodation;