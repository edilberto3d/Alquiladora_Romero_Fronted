import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RutaPrivada = ({ children, rolesPermitidos }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.log("Verificando autenticación...");
    return <div>Loading...</div>; 
  }

  if (!user) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tienePermiso = rolesPermitidos.includes(user?.rol);

  return tienePermiso ? children : <Navigate to="/" state={{ from: location }} replace />;
};

export default RutaPrivada;
