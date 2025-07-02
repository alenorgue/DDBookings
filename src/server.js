// server.js
// Punto de entrada principal de la aplicación
console.log('Iniciando server.js');
import connectDB from './config/db.js';
import dotenv from 'dotenv';
console.log('dotenv importado');
import express from 'express';
console.log('express importado');
import mongoose from 'mongoose';
console.log('mongoose importado');
import path from 'path';
console.log('path importado');
import session from 'express-session';
console.log('express-session importado');
import MongoStore from 'connect-mongo';
console.log('connect-mongo importado');
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import methodOverride from 'method-override';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config(); // Cargar las variables de entorno desde el archivo .env
console.log('dotenv.config ejecutado');

// Importamos las rutas de cada contexto
console.log('Antes de importar rutas');
import userRoutes from './users/api/userRoutes.js';
console.log('userRoutes importado');
import accommodationRoutes from './accommodations/api/accommodationRoutes.js';
console.log('accommodationRoutes importado');
import authRoutes from './auth/api/authRoutes.js';
console.log('authRoutes importado');
import bookingsRoutes from './bookings/api/bookingsRoutes.js';
console.log('bookingsRoutes importado');
import adminRoutes from './web/adminRoutes/adminRoutes.js';
console.log('adminRoutes importado');
import viewRoutes from './web/routes/viewRoutes.js';
console.log('viewRoutes importado');

// Configuración del servidor Express
const app = express();
console.log('Express app creado');
app.use(express.json());
console.log('express.json habilitado');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
// Habilita method-override para soportar PUT y DELETE en formularios HTML
app.use(methodOverride('_method'));

// Configuración de la sesión (debe ir antes de montar rutas que usen req.session)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    dbName: process.env.MONGODB_DATABASE,
    collectionName: 'userSessions' 
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));

// Rutas base de cada contexto
console.log('Montando rutas...');
app.use('/api/accommodations', accommodationRoutes);
console.log('/api/accommodations montada');
app.use('/api/users', userRoutes);
console.log('/api/users montada');
app.use('/auth', authRoutes);
console.log('/auth montada');
app.use('/bookings', bookingsRoutes);
console.log('/bookings montada');
app.use('/admin', adminRoutes);
console.log('/admin montada');
app.use('/', viewRoutes);
console.log('Rutas web montadas');
// Conexión a la base de datos MongoDB
connectDB();
console.log('connectDB llamado');

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  const err = new Error('Página no encontrada');
  err.status = 404;
  next(err);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    user: req.session && req.session.user ? req.session.user : null
  });
});
console.log('Middleware de errores montado');

// Iniciar el servidor
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
console.log('app.listen llamado');
console.log('Vistas buscadas en:', path.join(__dirname, 'views'));




