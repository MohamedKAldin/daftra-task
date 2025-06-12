class User {
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static fromApi(data) {
    return new User(data);
  }
}

export default User; 