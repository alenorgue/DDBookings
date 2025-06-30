// updateAccommodationController.js
import UpdateAccommodation from '../application/UpdateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';

const accommodationRepo = new MongoAccommodationRepository();
const userRepo = new MongoUserRepository();

export const updateAccommodationController = async (req, res, next) => {
  try {
    const updateAccommodation = new UpdateAccommodation(accommodationRepo, userRepo);
    const updated = await updateAccommodation.execute(req.params.id, req.body);
    res.status(200).json({ message: 'Alojamiento actualizado', accommodation: updated });
  } catch (err) {
    next(err);
  }
};
