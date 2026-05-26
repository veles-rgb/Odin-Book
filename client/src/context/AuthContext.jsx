import { useState } from 'react';
import { createContext, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthContextPorvider = ({ children }) => {
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
