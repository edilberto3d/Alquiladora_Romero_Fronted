import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/usuarios/perfil', { withCredentials: true });
        console.log("Autocontext login", response.data.user);
        console.log("Autocontext login","Sesion correcto");
        setUser(response.data.user); 
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await axios.post('http://localhost:3001/api/usuarios/Delete/login', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };


  return (
    <AuthContext.Provider value={{ user, setUser, isLoading , logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
