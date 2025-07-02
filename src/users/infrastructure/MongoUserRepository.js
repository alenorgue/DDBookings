// MongoUserRepository.js
// Implementación concreta del repositorio usando MongoDB y Mongoose.

import UserModel from '../models/UserModel.js';
import User from '../domain/User.js';
import bcrypt from 'bcryptjs';

class MongoUserRepository {
  async findByEmail(email) {
    const data = await UserModel.findOne({ email });
    if (!data) return null;
    return new User({ id: data._id, email: data.email, password: data.password, role: data.role });
  }

  async save(user) {
    // El hash de la contraseña se realiza en el middleware de Mongoose (UserModel)
    const model = new UserModel(user);
    return await model.save();
  }
  async findById(id) {
    const data = await UserModel.findById(id);
    if (!data) return null;
    // Devuelve todos los campos relevantes del usuario
    return new User({
      id: data._id,
      name: data.name,
      surName: data.surName,
      email: data.email,
      role: data.role,
      profilePicture: data.profilePicture,
      bio: data.bio,
      phoneNumber: data.phoneNumber,
      country: data.country,
      language: data.language
      // Agrega aquí cualquier otro campo que uses en la vista
    });
  }
  async updateUser(userId, updateData) {
    try {
      // No permitir cambiar el email
      delete updateData.email;

      // Eliminar campos vacíos para no sobrescribir
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'string' && updateData[key].trim() === '') {
          delete updateData[key];
        }
      });

      // Si hay nueva contraseña, la hasheamos
      if (updateData.password && updateData.password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      } else {
        delete updateData.password; // No actualizar si no hay valor
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('Usuario no encontrado');
      }

      return updatedUser;
    } catch (err) {
      throw new Error('Error actualizando perfil: ' + err.message);
    }
  }

  async getById(id) {
    // Reutiliza findById para mantener compatibilidad con el use case
    return this.findById(id);
  }
}
export default MongoUserRepository;
