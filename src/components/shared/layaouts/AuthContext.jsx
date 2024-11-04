import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // Obtener el token CSRF al montar el componente
  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token', { withCredentials: true });
      setCsrfToken(response.data.csrfToken); 
    } catch (error) {
      console.error('Error obteniendo el token CSRF:', error);
    }
  };

  // Verificar la autenticación
  const checkAuth = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/usuarios/perfil', { withCredentials: true });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        console.log("Valor de context Usuarios", response.data.user)
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando la autenticación:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    try {
    
      if (!csrfToken) {
        await fetchCsrfToken();
      }

      await axios.post('https://alquiladora-romero-backed-1.onrender.com/api/usuarios/Delete/login', {}, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });

      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };


  useEffect(() => {
    fetchCsrfToken(); 
    checkAuth();     
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, checkAuth, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
