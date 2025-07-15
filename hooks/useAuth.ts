import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '@/store/slices/authSlice';
import serverHandler from '@/utils/serverHandler';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthReturn {
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, name: string, password: string, mobile_with_country_code: string, acceptPolicy: boolean) => Promise<any>;
  loginWithGoogle: (token: string) => Promise<any>;
  loginWithFacebook: (token: string, userId: string, email: string, name: string) => Promise<any>;
  adminLogin: (email: string, password: string) => Promise<any>;
  logout: () => void;
  getMe: () => Promise<any>;
  verifyToken: () => Promise<any>;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthReturn {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/api/user/login', { email, password });
      localStorage.setItem('serviceToken', response.data.token);
      dispatch(loginAction({
        id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
      }));
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, name: string, password: string, mobile_with_country_code: string, acceptPolicy: boolean | number) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/api/user/signup', {
        email,
        name,
        password,
        mobile_with_country_code,
        acceptPolicy
      });
      // Optionally store in localStorage for demo purposes
      window.localStorage.setItem('users', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/login_with_google', { token });
      localStorage.setItem('serviceToken', response.data.token);
      dispatch(loginAction({
        id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
      }));
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed');
      setLoading(false);
      throw err;
    }
  };

  const loginWithFacebook = async (token: string, userId: string, email: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/login_with_facebook', { token, userId, email, name });
      localStorage.setItem('serviceToken', response.data.token);
      dispatch(loginAction({
        id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
      }));
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Facebook login failed');
      setLoading(false);
      throw err;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/api/admin/login', { email, password });
      localStorage.setItem('serviceToken', response.data.token);
      localStorage.setItem('role', 'admin');
      setLoading(false);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin login failed');
      setLoading(false);
      throw err;
    }
  };

  const getMe = async () => {
    setLoading(true);
    setError(null);
    try {
      // If your backend has a getMe endpoint, update here. Otherwise, use /verify to get user info.
      const response: any = await serverHandler.get('/verify');
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('adminToken');
    dispatch(logoutAction());
  };

  const verifyToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.get('/verify');
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token verification failed');
      setLoading(false);
      throw err;
    }
  };

  return {
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    adminLogin,
    logout,
    getMe,
    verifyToken,
    loading,
    error,
  };
} 