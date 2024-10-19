import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaQuestionCircle } from "react-icons/fa";
import { IconButton, Box, Avatar } from "@mui/material";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  FaUser,
  FaSignOutAlt,
  FaCommentDots,
  FaUtensils,
} from "react-icons/fa";
import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../css/perfil.css";
//Impotamos localstore
import { useAuth } from "../shared/layaouts/AuthContext";

const LoginLink = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Link to="/login">
        <IconButton
          sx={{
            color: "black",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
          }}
        >
          <FontAwesomeIcon icon={faUser} />
        </IconButton>
      </Link>
    </Box>
  );
};

const InconoPerfil = () => {
  const { user, isLoading, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Manejar el logout
  const handleLogout = () => {
    logout();

    Swal.fire({
      title: "Sesión cerrada",
      text: "Has cerrado sesión correctamente.",
      icon: "success",
      confirmButtonText: "OK",
      width: "300px",
      customClass: {
        popup: "small-swal",
        title: "small-title",
        content: "small-text",
        confirmButton: "small-confirm",
      },
      buttonsStyling: false,
    }).then(() => {
      navigate("/login");
    });
  };

  // Lógica para manejar el nombre de usuario y foto de perfil
  useEffect(() => {
    if (user) {
      setUsername(user.Nombre?.charAt(0).toUpperCase());
      setFotoPerfil(user.foto_perfil);
    }
  }, [user]);

  // Mostrar mensaje de carga mientras se obtiene el estado de autenticación
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div
        className="profile-icon"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {fotoPerfil ? (
          <Avatar src={fotoPerfil} alt={username} className="avatar-img" />
        ) : (
          <Avatar className="avatar-letter">{username}</Avatar>
        )}
      </div>

      {dropdownOpen && (
        <div className="profile-dropdown">
          <ul className="dropdown-menu show">
            <li className="dropdown-item">
              {/* Enlace para Mi Perfil */}
              <Link to="/perfil" className="dropdown-link">
                <FaUser className="dropdown-icon" /> Mi Perfil
              </Link>
            </li>
            <li className="dropdown-item">
              {/* Enlace para Configuración */}
              <Link to="/configuracion" className="dropdown-link">
                <FaQuestionCircle className="dropdown-icon" /> Configuración
              </Link>
            </li>
            <li className="dropdown-divider"></li>
            <li className="dropdown-item cerrar-sesion" onClick={handleLogout}>
              {/* Enlace para cerrar sesión */}
              <FaSignOutAlt className="dropdown-icon" /> Cerrar Sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export { LoginLink, InconoPerfil };
