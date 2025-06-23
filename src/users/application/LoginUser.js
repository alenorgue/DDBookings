import bcrypt from "bcryptjs";

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    // Buscar el usuario por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Contraseña incorrecta");
    }

    // Retornar el usuario autenticado
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

export default LoginUser;