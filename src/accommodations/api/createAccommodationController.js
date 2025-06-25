// createAccommodationController.js
import CreateAccommodation from '../application/CreateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { findUserById } from '../../users/infrastructure/findUserById.js';

const accommodationRepo = new MongoAccommodationRepository();

export const createAccommodationController = async (req, res) => {
    try {
        const hostId = req.body.hostId;
        const user = await findUserById(hostId);

        if (!user || user.role !== 'host') {
            return res.status(403).json({ error: 'Solo los usuarios con rol host pueden crear alojamientos.' });
        }

        // Obtener imágenes y etiquetas
        const mainPhotoUrl = req.files?.mainPhoto?.[0]?.path;
        const additionalPhotos = req.files?.photos || [];
        const labels = req.body.photoLabels?.split(',').map(l => l.trim()) || [];

        if (!mainPhotoUrl) {
            return res.status(400).json({ error: 'Se requiere una foto principal.' });
        }

        const photos = additionalPhotos.map((file, i) => ({
            url: file.path,
            label: labels[i] || ''
        }));

        const data = {
            title: req.body.title,
            description: req.body.description,
            pricePerNight: Number(req.body.pricePerNight),
            squareMeters: Number(req.body.squareMeters),
            rooms: Number(req.body.rooms),
            beds: Number(req.body.beds),
            maxGuests: Number(req.body.maxGuests),
            bathrooms: Number(req.body.bathrooms),
            petsAllowed: req.body.petsAllowed === 'true',
            propertyType: req.body.propertyType || 'Other',
            cancellationPolicy: req.body.cancellationPolicy || 'Flexible',
            houseRules: req.body.houseRules || '',
            checkIn: req.body.checkIn,
            checkOut: req.body.checkOut,
            status: 'Available', // Por defecto, el alojamiento se crea como activo
            amenities: Array.isArray(req.body.amenities)
                ? req.body.amenities
                : req.body.amenities?.split(',').map(a => a.trim()) || [],
            location: {
                address: req.body['address'] || req.body['location.address'],
                city: req.body['city'] || req.body['location.city'],
                country: req.body['country'] || req.body['location.country'],
                postalCode: req.body['postalCode'] || req.body['location.postalCode'],
                coordinates: {
                    lat: parseFloat(req.body['location.lat']),
                    lng: parseFloat(req.body['location.lng']),
                }
            },
            mainPhoto: mainPhotoUrl,
            photos: photos,
            hostId: user._id.toString(),
        };

        const createAccommodation = new CreateAccommodation(accommodationRepo);
        const accommodation = await createAccommodation.execute(data);

        return res.status(201).json({
            message: 'Alojamiento creado correctamente.',
            accommodation
        });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
