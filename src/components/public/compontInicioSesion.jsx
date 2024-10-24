import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaQuestionCircle } from "react-icons/fa";

import {faUser, faSignOutAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import {
  FaUser,
  FaSignOutAlt,
  FaCommentDots,
  FaUtensils,
} from "react-icons/fa";
import { Avatar, Menu, MenuItem, Divider, IconButton, 
  ClickAwayListener, Typography, Box } from "@mui/material";
import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../css/perfil.css";
//Impotamos localstore
import { useAuth } from "../shared/layaouts/AuthContext";
import { ThemeContext } from "../shared/layaouts/ThemeContext";

const LoginLink = () => {
  const { theme } = useContext(ThemeContext);
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
            color: theme === "light" ? "black" : "white",
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
  const [anchorEl, setAnchorEl] = useState(null);  // Para controlar el menú
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
  const username = user?.nombre?.charAt(0).toUpperCase();
  const fotoPerfil = user?.foto_perfil;

  // Abrir el menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Cerrar el menú
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mostrar mensaje de carga mientras se obtiene el estado de autenticación
  if (isLoading) return <div>Loading...</div>;

  return (
    <ClickAwayListener onClickAway={handleMenuClose}>
      <Box>
        <IconButton onClick={handleMenuOpen}>
          {fotoPerfil ? (
            <Avatar src={fotoPerfil} alt={username} />
          ) : (
            <Avatar>{username}</Avatar>
          )}
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              transform: 'translateY(10px)',
              width: '200px',
              padding: '10px 0',
            },
          }}
        >
          <MenuItem onClick={handleMenuClose} component={Link} to="/cliente/perfil">
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 10 }} />
            <Typography>Mi Perfil</Typography>
          </MenuItem>

          <MenuItem onClick={handleMenuClose} component={Link} to="/configuracion">
            <FontAwesomeIcon icon={faCog} style={{ marginRight: 10 }} />
            <Typography>Configuración</Typography>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 10 }} />
            <Typography>Cerrar Sesión</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </ClickAwayListener>
  );
};


export { LoginLink, InconoPerfil };
