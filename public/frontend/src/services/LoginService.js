import axios from 'axios';
import User from '../models/User.js';
import ApiEndpoints from '../ApiEndpoints.js';

const LoginService = {
  async login(credentials) {
    const response = await axios.post(ApiEndpoints.login, credentials);
    const { token, user } = response.data;
    return { token, user: User.fromApi(user) };
  },

  async fetchUser() {
    const response = await axios.get(ApiEndpoints.fetchUser);
    return User.fromApi(response.data);
  }
};

export default LoginService; 