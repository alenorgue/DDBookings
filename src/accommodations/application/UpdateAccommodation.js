// UpdateAccommodation.js
import Accommodation from '../domain/Accommodation.js';

class UpdateAccommodation {
  constructor(accommodationRepository) {
    this.accommodationRepository = accommodationRepository;
  }

  async execute(id, data) {
    // Validaciones similares a CreateAccommodation (puedes refactorizar para reutilizar)
    // Aquí solo se validan los campos que se permiten actualizar
    if (data.title && (data.title.length < 5 || data.title.length > 100)) {
      throw new Error('El título debe tener entre 5 y 100 caracteres');
    }
    if (data.description && (data.description.length < 30 || data.description.length > 2000)) {
      throw new Error('La descripción debe tener entre 30 y 2000 caracteres');
    }
    // ...agrega más validaciones según el schema...

    // Actualizar en el repositorio
    const updated = await this.accommodationRepository.update(id, data);
    if (!updated) throw new Error('Alojamiento no encontrado o no actualizado');
    return updated;
  }
}

export default UpdateAccommodation;
