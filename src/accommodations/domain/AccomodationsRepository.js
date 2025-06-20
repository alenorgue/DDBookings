class AccommodationRepository {
  /**
   * Guarda un alojamiento
   * @param {Accommodation} accommodation
   */
  async save(accommodation) {
    throw new Error('Not implemented');
  }

  /**
   * Busca alojamiento por ID
   * @param {string} id
   * @returns {Accommodation|null}
   */
  async findById(id) {
    throw new Error('Not implemented');
  }

  /**
   * Devuelve todos los alojamientos
   * @returns {Accommodation[]}
   */
  async findAll() {
    throw new Error('Not implemented');
  }
}

export default AccommodationRepository;
