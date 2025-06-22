// server.js
// Punto de entrada principal de la aplicación
console.log('Iniciando server.js');
import dotenv from 'dotenv';
console.log('dotenv importado');
import express from 'express';
console.log('express importado');
import mongoose from 'mongoose';
console.log('mongoose importado');
import path from 'path';
console.log('path importado');
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importamos las rutas de cada contexto
console.log('Antes de importar rutas');
import userRoutes from './users/api/userRoutes.js';
console.log('userRoutes importado');
import accommodationRoutes from './accommodations/api/accommodationRoutes.js';
console.log('accommodationRoutes importado');

dotenv.config(); // Cargar las variables de entorno desde el archivo .env
console.log('dotenv.config ejecutado');
// Configuración del servidor Express
const app = express();
console.log('Express app creado');
app.use(express.json());
console.log('express.json habilitado');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

// Rutas base de cada contexto
console.log('Montando rutas...');
app.use('/api/accommodations', accommodationRoutes);
console.log('/api/accommodations montada');
app.use('/api/users', userRoutes);
console.log('/api/users montada');
import viewRoutes from './web/routes/viewRoutes.js';
app.use('/', viewRoutes);
console.log('Rutas web montadas');

// Conexión a la base de datos MongoDB
async function connectDB() {
  try {
    console.log('Intentando conectar a MongoDB...');
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DATABASE
    });
    console.log('Conexión a MongoDB establecida');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    console.error('Variables de entorno:', {
      user: process.env.MONGODB_USER ? 'definido' : 'indefinido',
      password: process.env.MONGODB_PASSWORD ? 'definido' : 'indefinido',
      cluster: process.env.MONGODB_CLUSTER ? 'definido' : 'indefinido',
      database: process.env.MONGODB_DATABASE ? 'definido' : 'indefinido'
    });
  }
}
connectDB();
console.log('connectDB llamado');


// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
console.log('Middleware de errores montado');

// Iniciar el servidor
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
console.log('app.listen llamado');

