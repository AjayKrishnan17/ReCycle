import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (!token) return setLoading(false);
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
