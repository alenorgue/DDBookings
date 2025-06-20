// server.js
// Punto de entrada principal de la aplicación
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
// Importamos las rutas de cada contexto
import userRoutes from './users/api/userRoutes.js';
import accommodationRoutes from './accommodations/api/accommodationRoutes.js';

// Configuración del servidor Express
const app = express();
app.use(express.json());

dotenv.config(); // Cargar las variables de entorno desde el archivo .env
// Rutas base de cada contexto
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);

// Conexión a la base de datos MongoDB
async function connectDB() {
  try {
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}`;
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

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});