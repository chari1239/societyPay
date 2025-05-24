"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getLoggedInUser, mockUsers } from '@/lib/mockData';
import { MOCK_USER_ID } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>; // Simulate async login
  logout: () => void;
  signup: (name: string, email: string, flat: string, pass: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking persisted auth state
    const storedUser = localStorage.getItem('societyPayUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // For demo purposes, auto-login mock user if no stored user
      // In a real app, this would be null until actual login
      // setUser(getLoggedInUser() || null); 
      // localStorage.setItem('societyPayUser', JSON.stringify(getLoggedInUser()));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = mockUsers.find(u => u.email === email); // Simplified check
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('societyPayUser', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = { id: `user-${Date.now()}`, name, email, flatNumber: flat, avatarUrl: 'https://placehold.co/100x100.png' };
    // In a real app, you'd save this user. Here, we just set them as logged in.
    mockUsers.push(newUser); // Add to mock data for this session
    setUser(newUser);
    localStorage.setItem('societyPayUser', JSON.stringify(newUser));
    setLoading(false);
    return true;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('societyPayUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
