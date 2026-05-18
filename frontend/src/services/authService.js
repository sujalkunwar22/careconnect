import client from "./httpClient";

const AuthService = {
  login: async (credentials) => {
    const identifier = credentials?.identifier || credentials?.email || credentials?.phone_number || credentials?.username;
    const payload = {
      identifier: identifier,
      email: identifier,
      username: identifier,
      password: credentials?.password
    };
    const response = await client.post('/auth/login/', payload);
    return response.data;
  },

  register: async (userData) => {
    const response = await client.post('/auth/register/', userData);
    return response.data;
  },

  verifyOtp: async (data) => {
    // data: { email, otp }
    const response = await client.post('/auth/verify-otp/', data);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await client.get('/users/profile/');
    return response.data;
  },
  
  getKycStatus: async () => {
    const response = await client.get('/users/kyc/status/');
    return response.data;
  }
};

export default AuthService;
