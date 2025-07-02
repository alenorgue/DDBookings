// User.js
// Entidad del dominio Usuario. Representa un usuario en el sistema.

class User {
  constructor({ id, name, surName, email, password, role, createdAt, profilePicture, bio, phoneNumber, country, language, isAdmin }) {
    this.id = id;
    this.name = name;
    this.surName = surName; // Apellido del usuario
    this.email = email;
    this.password = password;
    this.role = role; // 'guest' o 'host'
    this.createdAt =createdAt || new Date(); // Fecha de creación del usuario
    this.profilePicture = profilePicture; // URL de la foto de perfil del usuario
    this.bio = bio; // Biografía del usuario
    this.phoneNumber = phoneNumber; // Número de teléfono del usuario
    this.country = country // Dirección del usuario
    this.language = language; // Idioma preferido del usuario
     this.isAdmin = isAdmin; // Indica si el usuario es administrador
  }
}
export default User;
