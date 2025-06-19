// RegisterUser.js
// Caso de uso para registrar un nuevo usuario

const User = require('../domain/User');

class RegisterUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute({ email, password, role }) {
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new Error('Email ya registrado');

    const user = new User({ email, password, role });
    return await this.userRepo.save(user);
  }
}
module.exports = RegisterUser;
