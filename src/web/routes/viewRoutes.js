import express from 'express';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import MongoBookingRepository from '../../bookings/infrastructure/MongoBookingRepository.js';
import amenityIcons from '../../shared/amenityIcons.js';
import { ensureAuthenticated } from '../../auth/middleware/auth.js';
import { configDotenv } from 'dotenv';

const router = express.Router();
const userRepo = new MongoUserRepository();
const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

router.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});
// Renderiza la página principal con todos los apartamentos
// Esta ruta se usa para mostrar la lista de alojamientos en la página principal

router.get('/accommodations', async (req, res) => {
  try {
    const { guests, maxPrice, city } = req.query;
    const filter = {};

    // Aplica filtros solo si existen en la query
    if (guests) {
      filter.maxGuests = { $gte: parseInt(guests) };
    }

    if (maxPrice) {
      filter.pricePerNight = { $lte: parseFloat(maxPrice) };
    }

    if (city) {
      filter['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    const accommodations = Object.keys(filter).length > 0
      ? await accommodationRepo.findByFilter(filter)
      : await accommodationRepo.findAll(); // sin filtro → todos

    res.render('accommodationsList', {
      accommodations,
      amenityIcons,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      query: req.query // para persistencia en el formulario
    });

  } catch (err) {
    console.error('Error en GET /accommodations:', err);
    res.status(500).send('Error al obtener alojamientos');
  }
});
// Renderiza la página de detalles de un alojamiento específico
router.get('/accommodations/:id', async (req, res) => {
  // Validación de ObjectId para evitar CastError
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).send('ID de alojamiento no válido');
  }
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');

    // Obtener reservas relacionadas
    const bookings = await bookingRepo.findByAccommodationId(req.params.id);

    // Fechas reservadas (para el calendario)
    const bookedDates = bookings.map(b => ({
      start: b.startDate,
      end: b.endDate
    }));

    // Fechas disponibles desde el alojamiento
    const availableDates = (accommodation.availability || []).map(d => 
      d instanceof Date ? d.toISOString().slice(0, 10) : 
      (d && d.$date ? new Date(d.$date).toISOString().slice(0, 10) : d)
    );

    res.render('accommodationsDetails', {
      accommodation,
      amenityIcons,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      availability: availableDates,
      bookedDates
    });
  } catch (err) {
    console.error('Error al cargar el alojamiento:', err);
    res.status(500).send('Error al cargar el alojamiento');
  }
});

// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', ensureAuthenticated, (req, res) => {
  res.render('createAccommodation', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, 
    amenityIcons: amenityIcons,
    user: req.session.user // <-- pasa el usuario logueado
  });
});

// Renderiza el formulario para crear un nuevo alojamiento (ruta alternativa para dashboard)
router.get('/accommodations/createAccommodation', ensureAuthenticated, (req, res) => {
  res.render('createAccommodation', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    amenityIcons: amenityIcons,
    user: req.session.user // <-- pasa el usuario logueado
  });
});

// Renderiza el formulario para registrar un nuevo usuario
router.get('/register', (req, res) => {
  res.render('RegisterUser');
});

// Renderiza el formulario de inicio de sesión
router.get('/login', (req, res) => {
  res.render('Login');
});

// Renderiza el dashboard del usuario
router.get('/dashboard/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await userRepo.findById(req.params.id);
    console.log('DASHBOARD user.id:', user.id);
    if (!user) return res.status(404).send('Usuario no encontrado');

    const userAccommodations = await accommodationRepo.findByHostId(user.id);
   
    // Enriquecer reservas del usuario con datos del alojamiento
    const userBookingsRaw = await bookingRepo.findByGuestId(user.id);
    const userBookings = await Promise.all(userBookingsRaw.map(async (res) => {
      let acc = null;
      try {
        acc = await accommodationRepo.findById(res.accommodationId);
      } catch (e) {}
      return {
        ...res,
        accommodationTitle: acc ? acc.title : res.accommodationId,
        mainPhoto: acc ? acc.mainPhoto : '',
        guests: res.guests
      };
    }));

    // Reservas en alojamientos del usuario (host)
    const hostBookings = await bookingRepo.findByHostId(user.id);

    res.render('dashboard', {
      user,
      userAccommodations,
      userBookings,
      hostBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar el dashboard');
  }
});

// Elimina este POST duplicado para evitar conflicto con el de bookingsRoutes
// router.post('/bookings/:id/cancel', async (req, res) => { ... });

router.get('/bookings/guest/:guestId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.guestId);
    res.render('bookingsByGuest', { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del huésped');
  }
});

router.get('/bookings/host/:hostId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);
    res.render('bookingsByHost', { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del anfitrión');
  }
});

router.get('/bookings/accommodation/:accommodationId', async (req, res) => {
  try {
    const bookings = await bookingRepo.findByAccommodationId(req.params.accommodationId);
    res.render('bookingsByAccommodation', { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener reservas del alojamiento');
  }
});

// Vista para editar alojamiento
router.get('/accommodations/:id/update', ensureAuthenticated, async (req, res) => {
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');
    // Solo el host propietario puede editar
    if (!req.session.user || accommodation.hostId !== req.session.user.id) {
      return res.status(403).send('No tienes permisos para editar este alojamiento');
    }
    res.render('updateAccommodation', { accommodation });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

export default router;