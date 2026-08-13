import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const register = async (registerData) => {
    try {
      await api.post('/auth/register', registerData);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.put('/users/profile', updatedData);
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  };

  const loginAsDemo = async (role = 'ADMIN') => {
    const demoCredentials = {
      ADMIN: { email: 'admin@eventhub.com', password: 'password123' },
      ORGANIZER: { email: 'organizer@eventhub.com', password: 'password123' },
      ATTENDEE: { email: 'attendee@eventhub.com', password: 'password123' },
    };

    const creds = demoCredentials[role] || demoCredentials.ADMIN;
    
    try {
      const response = await api.post('/auth/login', creds);
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      // Fallback demo user for offline or testing mode
      const mockUser = {
        id: `demo-${role.toLowerCase()}-1`,
        name: role === 'ADMIN' ? 'Quản trị viên (Admin)' : role === 'ORGANIZER' ? 'Nhà tổ chức Sự kiện' : 'Người tham gia Demo',
        email: creds.email,
        role: role,
        avatar: `https://i.pravatar.cc/150?u=${role.toLowerCase()}`
      };
      const mockToken = `demo-jwt-token-${role.toLowerCase()}`;
      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
