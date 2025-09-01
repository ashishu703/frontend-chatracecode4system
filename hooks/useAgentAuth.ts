import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction, setToken, updateAgent } from '@/store/slices/agentAuthSlice';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';

interface Agent {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  is_active: number;
  comments?: string;
  created_at: string;
  updated_at: string;
}

interface AuthReturn {
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, mobile: string, comments?: string) => Promise<any>;
  logout: () => void;
  getMe: () => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export function useAgentAuth(): AuthReturn {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/api/agent/login', { email, password });
      dispatch(setToken(response.data.token));
      
      // Get agent profile
      const profileResponse: any = await serverHandler.get('/api/agent/get_me', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      });
      
      dispatch(loginAction(profileResponse.data.data));
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, mobile: string, comments?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.post('/api/agent/add_agent', {
        name,
        email,
        password,
        mobile,
        comments
      });
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const getMe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.get('/api/agent/get_me');
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch agent');
      setLoading(false);
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await serverHandler.get(`/api/auth/modify_password?pass=${newPassword}`);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password update failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agent');
    dispatch(logoutAction());
  };

  return {
    login,
    register,
    logout,
    getMe,
    updatePassword,
    loading,
    error,
  };
} 