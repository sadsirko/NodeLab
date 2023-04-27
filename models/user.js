const uuidv4 = require('uuid').v4;

class User {
  constructor(username, email, password, salt, role = "user", id = uuidv4()) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.hashedPassword = password;
    this.salt = salt
    this.role = role;
    this.createdAt = new Date();
    // Додаткові поля можна додати тут
  }

  
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      hashedPassword: this.hashedPassword,
      salt: this.salt,
      role: this.role,
      createdAt: this.createdAt.toISOString(), // Serialize the date to ISO string format
    };
  }

  static fromJSON(json) {
    const { id, username, email, hashedPassword, role, createdAt } = json;
    const user = new User(username, email, hashedPassword, role);
    user.id = id;
    user.createdAt = new Date(createdAt); // Deserialize the date from ISO string format
    return user;
  }

  getId() {
    return this.id;
  }

  getUsername() {
    return this.username;
  }

  getEmail() {
    return this.email;
  }

  getRole() {
    return this.role;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // Методи для зміни даних користувача можна додати тут

}

module.exports = User;
