// scripts/seedAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/users/models/UserModel.js';
import connectDB from './src/config/db.js';

dotenv.config();

async function seedAdmin() {
  try {
    await connectDB();
    console.log('Conexión a la base de datos establecida');

    const existing = await User.findOne({ email: 'admin@demo.com' });

    if (existing) {
      if (!existing.isAdmin) {
        existing.isAdmin = true;
        await existing.save();
        console.log('Se actualizó el usuario como admin');
      } else {
        console.log('El usuario admin ya existe');
      }
    } else {
      const admin = new User({
        name: 'Admin',
        surName: '',
        email: '',
        password: '', // se hasheará automáticamente con el pre('save')
        role: 'host', // o 'guest', según quieras
        isAdmin: true,
        profilePicture: '',
        bio: 'Administrador del sistema, aquí para ayudar.',
        phoneNumber: '+34 --------',
        createdAt: new Date(),
        language: 'es',
        country: 'España'
      });

      await admin.save();
      console.log('Usuario administrador creado');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error en seedAdmin:', err);
    process.exit(1);
  }
}

seedAdmin();
