import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ts_token'));

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('ts_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const login = async (email, pass) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('ts_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name, email, pass, role = 'analyst') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password: pass, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('ts_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const demoLogin = async (demoRole) => {
    const email = demoRole === 'analyst' ? 'analyst@trustshield.ai' : 'auditor@trustshield.ai';
    const password = demoRole === 'analyst' ? 'trustshield123' : 'audit2026';
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('ts_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      demoLogin,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
