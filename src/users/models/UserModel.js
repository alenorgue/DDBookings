// UserModel.js
// Modelo de Mongoose que representa la colección 'users' en MongoDB

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'host'], default: 'guest' }
});

module.exports = mongoose.model('User', userSchema);
