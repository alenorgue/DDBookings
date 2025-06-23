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
    // Cifrar la contraseña antes de guardar
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    const model = new UserModel(user);
    return await model.save();
  }
  async findById(id) {
    const data = await UserModel.findById(id);
    if (!data) return null;
    return new User({ id: data._id, email: data.email, role: data.role });
  }
  async updateUser(userId, updateData) {
    try {
      // No permitir cambiar el email
      delete updateData.email;

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
}
export default MongoUserRepository;
