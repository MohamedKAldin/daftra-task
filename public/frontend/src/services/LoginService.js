import axios from 'axios';
import User from '../models/User.js';

const LoginService = {
  async login(credentials) {
    const response = await axios.post('http://localhost:8000/api/login', credentials);
    const { token, user } = response.data;
    return { token, user: User.fromApi(user) };
  },

  async fetchUser() {
    const response = await axios.get('/api/user');
    return User.fromApi(response.data);
  }
};

export default LoginService; 