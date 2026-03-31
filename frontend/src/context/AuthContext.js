import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vault_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const inactivityTimer = useRef(null);

  const logout = useCallback((reason) => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setUser(null);
    setLocked(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const lockVault = useCallback(() => {
    setLocked(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!user) return;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(lockVault, INACTIVITY_LIMIT);
  }, [user, lockVault]);

  // Listen for activity
  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  // Listen for 401 events
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('vault:logout', handler);
    return () => window.removeEventListener('vault:logout', handler);
  }, [logout]);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data); localStorage.setItem('vault_user', JSON.stringify(data)); })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vault_token', data.token);
    localStorage.setItem('vault_user', JSON.stringify(data.user));
    setUser(data.user);
    setLocked(false);
    return data;
  };

  const signup = async (username, email, password) => {
    const { data } = await api.post('/auth/signup', { username, email, password });
    localStorage.setItem('vault_token', data.token);
    localStorage.setItem('vault_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const unlock = async (password) => {
    await api.post('/auth/verify-password', { password });
    setLocked(false);
    resetInactivityTimer();
  };

  const verifyPassword = async (password) => {
    const { data } = await api.post('/auth/verify-password', { password });
    return data.verified;
  };

  return (
    <AuthContext.Provider value={{ user, loading, locked, login, signup, logout, lockVault, unlock, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
