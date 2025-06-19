// User.js
// Entidad del dominio Usuario. Representa un usuario en el sistema.

class User {
  constructor({ id, name,  email, password, role }) {
    this.id = id;
     this.name = name;
     this.email = email;
    this.password = password;
    this.role = role; // 'guest' o 'host'
  }
}
module.exports = User;
