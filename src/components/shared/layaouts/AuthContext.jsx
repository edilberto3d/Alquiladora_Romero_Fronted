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
      const response = await axios.get('http://localhost:3001/api/get-csrf-token', { withCredentials: true });
      setCsrfToken(response.data.csrfToken); // Guardar el token CSRF
    } catch (error) {
      console.error('Error obteniendo el token CSRF:', error);
    }
  };

  // Verificar la autenticación
  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/usuarios/perfil', { withCredentials: true });
      if (response.data && response.data.user) {
        setUser(response.data.user);
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

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Asegurarse de obtener el CSRF token antes de hacer la solicitud
      if (!csrfToken) {
        await fetchCsrfToken();
      }

      await axios.post('http://localhost:3001/api/usuarios/Delete/login', {}, {
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
