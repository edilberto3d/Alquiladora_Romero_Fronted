import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RutaPrivada = ({ children, rolesPermitidos }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.log("ContextAutentication cargando");
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cambia 'user.rol' por 'user.Rol'
  const tienePermiso = rolesPermitidos.includes(user.Rol);
  console.log("ContextAutentication cargando", tienePermiso);

  return tienePermiso ? children : <Navigate to="/" state={{ from: location }} replace />;
};

export default RutaPrivada;
