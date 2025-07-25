import express from 'express';
import MongoUserRepository from '../../users/infrastructure/MongoUserRepository.js';
import MongoAccommodationRepository from '../../accommodations/infrastructure/MongoAccommodationRepository.js';
import MongoBookingRepository from '../../bookings/infrastructure/MongoBookingRepository.js';
import amenityIcons from '../../shared/amenityIcons.js';
import { ensureAuthenticated } from '../../auth/middleware/auth.js';


const router = express.Router();
const userRepo = new MongoUserRepository();
const bookingRepo = new MongoBookingRepository();
const accommodationRepo = new MongoAccommodationRepository();

router.get('/', async (req, res, next) => {
  try {
    const accommodations = await accommodationRepo.findAllAvailable();
    res.render('index', {
      user: req.session.user || null,
      accommodations,
      amenityIcons
    });
    return;
  } catch (err) {
    console.error('Error al cargar la página principal:', err);
    next(err);
  }
});
// Renderiza la página principal con todos los apartamentos
// Esta ruta se usa para mostrar la lista de alojamientos en la página principal

router.get('/accommodations', async (req, res, next) => {
  try {
    const { guests, maxPrice, province, checkIn, checkOut } = req.query;
    const filter = {};
    if (guests) filter.maxGuests = { $gte: parseInt(guests) };
    if (maxPrice) filter.pricePerNight = { $lte: parseFloat(maxPrice) };
    if (province) {
      // Permitir varias provincias separadas por coma
      const provinces = Array.isArray(province) ? province : province.split(',').map(p => p.trim()).filter(Boolean);
      if (provinces.length === 1) {
        filter['location.province'] = provinces[0];
      } else if (provinces.length > 1) {
        filter['location.province'] = { $in: provinces };
      }
    }

    let accommodations = Object.keys(filter).length > 0
      ? await accommodationRepo.findByFilter(filter)
      : await accommodationRepo.findAllAvailable();

    // Filtrado por rango de fechas disponibles
    if (checkIn && checkOut) {
      // Importa la utilidad para rango de fechas
      const { getDateRangeArray } = await import('../../accommodations/utils/availabilityUtils.js');
      const range = getDateRangeArray(checkIn, checkOut);
      accommodations = accommodations.filter(acc => {
        // Convierte availability a array de YYYY-MM-DD
        const available = (acc.availability || []).map(d =>
          d instanceof Date ? d.toISOString().slice(0, 10) :
          (d && d.$date ? new Date(d.$date).toISOString().slice(0, 10) : d)
        );
        // Todas las fechas del rango deben estar en availability
        return range.every(date => available.includes(date));
      });
    }

    res.render('accommodationsList', {
      accommodations,
      amenityIcons,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      query: req.query, // para persistencia en el formulario
      user: req.session.user || null
    });
    return;
  } catch (err) {
    console.error('Error en GET /accommodations:', err);
    next(err);
  }
});
// Renderiza la página de detalles de un alojamiento específico
router.get('/accommodations/:id', async (req, res, next) => {
  // Validación de ObjectId para evitar CastError
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).send('ID de alojamiento no válido');
  }
  try {
    const accommodation = await accommodationRepo.findById(req.params.id);
    if (!accommodation) return res.status(404).send('Alojamiento no encontrado');

    // Obtener solo reservas confirmadas para el calendario
    const bookings = await bookingRepo.findConfirmedByAccommodationId(req.params.id);

    // Fechas reservadas (para el calendario)
    const bookedDates = bookings.map(b => ({
      start: b.startDate instanceof Date ? b.startDate.toISOString().slice(0, 10) : (b.startDate ? b.startDate.toString().slice(0, 10) : null),
      end: b.endDate instanceof Date ? b.endDate.toISOString().slice(0, 10) : (b.endDate ? b.endDate.toString().slice(0, 10) : null)
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
      bookedDates,
      user: req.session.user || null,
      successMessage: req.session.successMessage || null
    });
    if (req.session.successMessage) delete req.session.successMessage;
    return;
  } catch (err) {
    console.error('Error al cargar el alojamiento:', err);
    next(err);
  }
});

// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', ensureAuthenticated, (req, res) => {
  if (req.session.user.role !== 'host') {
    return res.render('onlyHosts');
  }
  res.render('CreateAccommodation', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, 
    amenityIcons: amenityIcons,
    user: req.session.user
  });
  return;
});

// Renderiza el formulario para crear un nuevo alojamiento (ruta alternativa para dashboard)
router.get('/accommodations/createAccommodation', ensureAuthenticated, (req, res) => {
  if (req.session.user.role !== 'host') {
    return res.render('onlyHosts');
  }
  res.render('CreateAccommodation', {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    amenityIcons: amenityIcons,
    user: req.session.user
  });
  return;
});

// Renderiza el formulario para registrar un nuevo usuario
router.get('/register', (req, res) => {
  res.render('RegisterUser', { user: req.session.user || null });
  return;
});

// Renderiza el formulario de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login', { user: req.session.user || null });
  return;
});

// Renderiza el dashboard del usuario
router.get('/dashboard/:id', ensureAuthenticated, async (req, res, next) => {
  console.log('DASHBOARD - req.session.user:', req.session.user);
  // Validar que el id es un ObjectId válido antes de consultar la base de datos
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).render('error', { message: 'ID de usuario no válido', error: null, user: req.session.user || null });
  }
  try {
    const user = await userRepo.findById(req.params.id);
    console.log('DASHBOARD user.id:', user && user.id);
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
      hostBookings,
      successMessage: req.session.successMessage || null
    });
    if (req.session.successMessage) delete req.session.successMessage;
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).render('error', { message: 'Error interno en el dashboard', error: err, user: req.session.user || null });
  }
});

// Elimina este POST duplicado para evitar conflicto con el de bookingsRoutes
// router.post('/bookings/:id/cancel', async (req, res) => { ... });

router.get('/bookings/guest/:guestId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByGuestId(req.params.guestId);
    res.render('bookingsByGuest', { bookings, user: req.session.user || null });
    return;
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/bookings/host/:hostId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByHostId(req.params.hostId);
    res.render('bookingsByHost', { bookings, user: req.session.user || null });
    return;
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/bookings/accommodation/:accommodationId', async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByAccommodationId(req.params.accommodationId);
    res.render('bookingsByAccommodation', { bookings, user: req.session.user || null });
    return;
  } catch (err) {
    console.error(err);
    next(err);
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
   res.render('updateAccommodation', {
  accommodation,
  user: req.session.user, // corregido para que siempre haya user
  amenityIcons,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY // corregido para que siempre haya valor
});
    return;
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Renderiza los detalles de una reserva
router.get('/bookings/:id/details', ensureAuthenticated, async (req, res, next) => {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return res.status(404).render('error', { message: 'Reserva no encontrada', error: null, user: req.session.user || null });

    const accommodation = await accommodationRepo.findById(booking.accommodationId);
    if (!accommodation) return res.status(404).render('error', { message: 'Alojamiento no encontrado', error: null, user: req.session.user || null });

    // Obtener datos de guest y host
    const guest = await userRepo.findById(booking.guestId);
    const host = await userRepo.findById(booking.hostId);
    const user = req.session.user || null;

    // Protección: solo guest, host o admin pueden ver
    const isAllowed = user && (user.id === String(guest.id) || user.id === String(host.id) || user.isAdmin === true);
    if (!isAllowed) {
      return res.status(403).render('error', { message: 'No tienes permiso para ver esta reserva', error: null, user });
    }

    res.render('bookingDetails', {
      booking,
      accommodation,
      guest,
      host,
      user
    });
    return;
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Vista temporal para secciones en desarrollo
router.get('/on-development', (req, res) => {
  res.render('onDevelopment', { user: req.session.user || null });
  return;
});

// Excepción para dejar pasar /bookings/:id/pdf al siguiente router (API)
router.get('/bookings/:id/pdf', (req, res, next) => {
  return next();
});


export default router;