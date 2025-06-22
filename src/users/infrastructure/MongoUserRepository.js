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
}
export default MongoUserRepository;
