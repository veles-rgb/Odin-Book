import { useState } from 'react';
import { createContext, useEffect } from 'react';

export const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken');
  });

  const login = ({ user, accessToken }) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);

    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');

    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    const refreshAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          logout();
          return;
        }

        const data = await response.json();

        login({
          user: data.user,
          accessToken: data.accessToken,
        });
      } catch (error) {
        logout();
      }
    };

    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
