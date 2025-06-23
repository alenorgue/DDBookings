// updateAccommodationController.js
import UpdateAccommodation from '../application/UpdateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';

const accommodationRepo = new MongoAccommodationRepository();

export const updateAccommodationController = async (req, res) => {
  try {
    const updateAccommodation = new UpdateAccommodation(accommodationRepo);
    const updated = await updateAccommodation.execute(req.params.id, req.body);
    res.status(200).json({ message: 'Alojamiento actualizado', accommodation: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
