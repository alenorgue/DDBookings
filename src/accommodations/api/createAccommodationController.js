// createAccommodationController.js
import CreateAccommodation from '../application/CreateAccommodation.js';
import MongoAccommodationRepository from '../infrastructure/MongoAccommodationRepository.js';
import { findUserById } from '../../users/infrastructure/findUserById.js';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';

const accommodationRepo = new MongoAccommodationRepository();
const userRepo = new MongoUserRepository();

export const createAccommodationController = async (req, res, next) => {
    try {
        const hostId = req.body.hostId;
        console.log('hostId recibido:', hostId);
        const user = await findUserById(hostId);
        console.log('user encontrado:', user);
        if (!user || (user.role && user.role.toLowerCase() !== 'host')) {
            req.session.errorMessage = 'Solo los usuarios con rol host pueden crear alojamientos.';
            return res.redirect('back');
        }

        // Obtener imágenes y etiquetas
        const mainPhotoUrl = req.files?.mainPhoto?.[0]?.path;
        const additionalPhotos = req.files?.photos || [];
        console.log('FOTOS ADICIONALES RECIBIDAS:', additionalPhotos);
        // Log para ver los paths reales
        additionalPhotos.forEach((file, i) => {
            console.log(`Foto adicional [${i}]: path=${file.path}`);
        });
        const labels = req.body.photoLabels?.split(',').map(l => l.trim()) || [];

        if (!mainPhotoUrl) {
            req.session.errorMessage = 'Se requiere una foto principal.';
            return res.redirect('back');
        }

        // Adaptar path a URL si es necesario (aceptar tanto http(s) como URLs de Cloudinary sin extensión)
        function isValidPhotoUrl(url) {
            // Permite http(s) y también URLs de Cloudinary que pueden no tener extensión
            return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url) || /^https?:\/\/.+\/v\d+\/.+/.test(url);
        }

        const photos = additionalPhotos.map((file, i) => ({
            url: file.path,
            label: labels[i] || ''
        })).filter(photo => isValidPhotoUrl(photo.url));

        if (additionalPhotos.length > 0 && photos.length === 0) {
            req.session.errorMessage = 'Las fotos adicionales no tienen una URL válida.';
            return res.redirect('back');
        }

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
            mainPhotoLabel: req.body.mainPhotoLabel || '',
            photos: photos,
            hostId: user._id.toString(),
        };
        console.log('Datos del alojamiento:', data);

        const createAccommodation = new CreateAccommodation(accommodationRepo, userRepo);
        const accommodation = await createAccommodation.execute(data);
        req.session.successMessage = 'Alojamiento creado correctamente';
        return res.redirect('/dashboard/' + user._id.toString());
    } catch (err) {
        req.session.errorMessage = err.message;
        return res.redirect('back');
    }
}
