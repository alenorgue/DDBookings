// RegisterUser.js
// Caso de uso para registrar un nuevo usuario

import User from '../domain/User.js';

class RegisterUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute({ name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language }) {
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new Error('Email ya registrado');

    // Validación de contraseña: al menos una mayúscula y una minúscula
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/;
    if (!passwordPattern.test(password)) {
      throw new Error('La contraseña debe contener Min 8 chars, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo');
    }

    const user = new User({ name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language });
    return await this.userRepo.save(user);
  }
}
export default RegisterUser;
