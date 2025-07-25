// UserModel.js
// Modelo de Mongoose que representa la colección 'users' en MongoDB

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/;

const userSchema = new Schema({
    name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
    surName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
     match: passwordRegex
  },
  role: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
    isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    match: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i,
    default: '',
    required: false
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  phoneNumber: {
    type: String,
    match: /^[0-9\-\+\s\(\)]{7,20}$/
  },
  country: {
    type: String,
    minlength: 2,
    maxlength: 100,
    trim: true
  },
  language: {
    type: String,
     enum: ['es', 'cat', 'en']
  }
}, {
  timestamps: true
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('User', userSchema);
