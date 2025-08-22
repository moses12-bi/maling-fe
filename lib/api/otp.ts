import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const otpAPI = {
  generateOTP: async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/otp/generate`, { email });
      return response.data;
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/otp/verify`, { email, otp });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  resendOTP: async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/otp/resend`, { email });
      return response.data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },
};
