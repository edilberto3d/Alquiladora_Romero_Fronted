import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faHeart,
  faSearch,
  faMapMarkerAlt,
  faBars,
  faPhone,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../../css/footer.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../shared/layaouts/AuthContext";
import { LoginLink, InconoPerfil } from "./compontInicioSesion";
import { InconoHeaderComedor } from "./inconoHeader";


const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  
  const [datosEmpresa, setDatosEmpresa]= useState([]);

  //Realizamos la consulta de la base de datos 



  //REalizamos la cosulta general de los usuarios
  useEffect(() => {
    console.log("Este es lo que me obtiene user", user)
  }, [user]);



  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };


  const menuItems = [
    { text: "Inicio", href: "/" },
    { text: "Catálogo", href: "/catalogo" },
    { text: "Servicios", href: "/servicios" },
    { text: "Contacto", href: "/contacto" },
    { text: "Cotiza Ahora", href: "/cotiza-ahora" },
  ];

  return (
    <Box sx={{ bgcolor: "background.paper" }}>
      {/* Información de contacto */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "info.main",
          color: "white",
          padding: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mx: 2 }}>
          <FontAwesomeIcon
            icon={faPhone}
            style={{ marginRight: "8px", color: "green" }}
          />
          <Typography>Llámamos: (123) 456-7890</Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{ mx: 2, fontWeight: "bold", textAlign: "center" }}
        >
          "Tu evento, nuestra prioridad"
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mx: 2 }}>
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            style={{ marginRight: "8px", color: "red" }}
          />
          <Typography>Ubicación: Ciudad XYZ</Typography>
        </Box>
      </Box>

      {/* Barra de navegación principal */}
      <AppBar position="static" sx={{ bgcolor: "grey.200", boxShadow: 2 }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo de la empresa */}

          <div className="title-container">
            <Typography
              variant="h6"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              <Link to="/">
                ALQUILADORA <br /> ROMERO</Link>
            </Typography>
          </div>


          {/* Menú de navegación */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.href}
                variant="text"
                sx={{
                  mx: 2,
                  color: "text.primary",
                  "&:hover": { color: "blue.500" },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Barra de búsqueda */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              maxWidth: { xs: "150px", md: "300px" },
              mx: 2,
            }}
          >
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              className="search-input" // Agrega clase para CSS
            />
            <IconButton sx={{ position: "absolute", right: 0 }}>
              <FontAwesomeIcon icon={faSearch} />
            </IconButton>
          </Box>

          {/* Iconos de usuario, favoritos y carrito */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user ? (
             
              user.Rol !== "Administrador" ? (
               
                user.Rol === "Cliente" ? (
                  <>
                    <InconoPerfil />
                  </>
                ) : (
                
                  <>
                  {/**ESYE APARECE */}
                    <InconoHeaderComedor nombreCompleto={`${user.nombre}`} />
                  </>
                )
              ) : (
               
                <LoginLink />
              )
            ) : (
            
              <LoginLink />
            )}



          

            <IconButton
              sx={{
                color: "text.primary",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              <FontAwesomeIcon icon={faHeart} />
            </IconButton>
            <IconButton
              sx={{
                color: "text.primary",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </IconButton>
            <IconButton
              sx={{
                display: { xs: "block", md: "none" },
                color: "text.primary",
              }}
              onClick={toggleDrawer}
            >
              <FontAwesomeIcon icon={faBars} />
            </IconButton>
          </Box>


        </Toolbar>
      </AppBar>

      {/* Drawer para el menú de hamburguesa */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: "250px", padding: 2, bgcolor: "grey.200" }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <IconButton onClick={toggleDrawer}>
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </Box>

          <Box
            sx={{
              textAlign: "left",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              ALQUILADORA
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: { xs: "1rem", md: "1.5rem" },
              }}
            >
              ROMERO
            </Typography>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItem button component="a" href={item.href} key={item.text}>
                <ListItemText
                  primary={item.text}
                  sx={{ color: "text.primary" }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          
        </Box>
      </Drawer>
    </Box>
  );
};

export default Header;
