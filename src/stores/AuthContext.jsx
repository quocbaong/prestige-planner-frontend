import React, { useState, useEffect } from 'react';
import { authService, clearSession } from '../services/authService';
import { userService } from '../services/userService';
import { AuthContext } from './authContext';

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
      const response = await authService.login(email, password);
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (error) {
      throw error.apiError?.message || error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const register = async (registerData) => {
    try {
      await authService.register(registerData);
    } catch (error) {
      throw error.apiError?.message || error.response?.data?.message || error.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const setSession = (userData, token = 'vendor-demo-token', refreshToken = 'vendor-demo-refresh') => {
    const normalizedUser = {
      id: userData.id || 'vendor-demo',
      email: userData.email || 'vendor@demo.local',
      fullName: userData.fullName || 'Vendor Demo',
      role: userData.role || 'VENDOR',
      isVerified: true,
      ...userData,
    };

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await userService.updateProfile(updatedData);
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};
