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

    const user = new User({ name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language });
    return await this.userRepo.save(user);
  }
}
export default RegisterUser;
