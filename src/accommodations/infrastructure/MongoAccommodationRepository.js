import AccommodationModel from '../models/AccommodationModel.js';
import Accommodation from '../domain/Accommodation.js';

class MongoAccommodationRepository {
    /**
     * Guarda un alojamiento en la base de datos
     * @param {Accommodation} accommodation
     * @returns {Promise<Accommodation>}
     */
    async save(accommodation) {
        const data = {
            title: accommodation.title,
            pricePerNight: accommodation.pricePerNight,
            squareMeters: accommodation.squareMeters,
            mainPhoto: accommodation.mainPhoto,
            photos: accommodation.photos,
            description: accommodation.description,
            location: accommodation.location,
            rooms: accommodation.rooms,
            beds: accommodation.beds,
            maxGuests: accommodation.maxGuests,
            bathrooms: accommodation.bathrooms,
            propertyType: accommodation.propertyType,
            amenities: accommodation.amenities,
            petsAllowed: accommodation.petsAllowed,
            houseRules: accommodation.houseRules,
            cancellationPolicy: accommodation.cancellationPolicy,
            checkIn: accommodation.checkIn,
            checkOut: accommodation.checkOut,
            hostId: accommodation.hostId
        };

        const created = await AccommodationModel.create(data);
         return new Accommodation({ ...data, id: created._id });
    }

    /**
     * Busca un alojamiento por ID
     * @param {string} id
     * @returns {Promise<Accommodation|null>}
     */
     async findById(id) {
    const found = await AccommodationModel.findById(id);
    if (!found) return null;
    return new Accommodation({ ...found.toObject(), id: found._id });
  }

    /**
     * Devuelve todos los alojamientos
     * @returns {Promise<Accommodation[]>}
     */
  async findAll() {
    const all = await AccommodationModel.find();
    return all.map(doc => new Accommodation({ ...doc.toObject(), id: doc._id }));
  }
}

export default MongoAccommodationRepository;

// Este código define un repositorio de MongoDB para gestionar alojamientos en una aplicación.
// Utiliza Mongoose para interactuar con la base de datos y define métodos para guardar,
// buscar por ID y listar todos los alojamientos. Cada método transforma los documentos de Mongoose
// en instancias de la entidad `Accommodation` del dominio, asegurando que la lógica de negocio
// se mantenga separada de la infraestructura de datos. Esto permite una mayor flexibilidad
// y facilita la implementación de pruebas unitarias, ya que se puede simular el repositorio
// sin depender de la base de datos real. Además, el uso de promesas permite manejar
// operaciones asíncronas de manera eficiente, lo que es crucial en aplicaciones web modernas
// que requieren una alta concurrencia y rendimiento.