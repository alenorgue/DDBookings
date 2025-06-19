// MongoUserRepository.js
// Implementación concreta del repositorio usando MongoDB y Mongoose.

const UserModel = require('../models/UserModel');
const User = require('../domain/User');

class MongoUserRepository {
  async findByEmail(email) {
    const data = await UserModel.findOne({ email });
    if (!data) return null;
    return new User({ id: data._id, email: data.email, password: data.password, role: data.role });
  }

  async save(user) {
    const model = new UserModel(user);
    return await model.save();
  }
}
module.exports = MongoUserRepository;
