import React, { useState, useEffect, useContext } from "react";
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
  Switch,
} from "@mui/material";
import Swal from "sweetalert2";
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
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import "../../css/footer.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../shared/layaouts/AuthContext";
import { LoginLink, InconoPerfil } from "./compontInicioSesion";
import { InconoHeaderComedor } from "./inconoHeader";
import { ThemeContext } from "../shared/layaouts/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser, checkAuth, isLoading } = useAuth();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  const [datosEmpresa, setDatosEmpresa] = useState([]);
  const navigate = useNavigate();
  //cONSTANTES DE INACTIVIDAD
  const [timeLeft, setTimeLeft] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const INACTIVITY_LIMIT = 10 * 60 * 1000; //1o mnts
  const ALERT_TIMEOUT = 10000;
  let inactivityTimer = null;
  let countdownTimer = null;
  const location = useLocation();
  const [csrfToken, setCsrfToken] = useState("");

  //Realizamos la consulta de la base de datos

  // Obtener el token CSRF cuando se carga el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/get-csrf-token",
          { withCredentials: true }
        );
        setCsrfToken(response.data.csrfToken); // Guardar el token CSRF en el estado
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  // ================================================================
  // Redirigir al usuario basado en su rol
  useEffect(() => {
    if (!isLoading && user) {
      const userType = user?.rol; // Ajustar según cómo esté configurado el rol
      if (location.pathname === "/") {
        // Redirigir basado en el rol si está en la página principal
        if (userType === "Cliente") {
          navigate("/cliente");
        } else if (userType === "Comedor") {
          navigate("/comedor");
        } else if (userType === "Administrador") {
          navigate("/Admnistrador");
        } else {
          navigate("/");
        }
      } else {
        // Redirigir basado en el rol si intenta acceder a otra ruta
        if (
          userType === "Cliente" &&
          !location.pathname.startsWith("/cliente")
        ) {
          navigate("/cliente");
        } else if (
          userType === "Comedor" &&
          !location.pathname.startsWith("/comedor")
        ) {
          navigate("/comedor");
        } else if (
          userType === "Administrador" &&
          !location.pathname.startsWith("/Administrador")
        ) {
          navigate("/Administrador");
        }
      }
    }
  }, [user, isLoading, location, navigate]);
  // Verificar autenticación al cargar la página
  useEffect(() => {
    if (!user) {
      // Solo verificar autenticación si el usuario no está definido
      const verifyAuth = async () => {
        await checkAuth(); // Verificar si el usuario está autenticado
        setIsLoggedIn(!!user); // Actualizar el estado de isLoggedIn basado en el usuario autenticado
      };
      verifyAuth();
    }
  }, [user, checkAuth]);

  //==================================================================================================================================
  //fUNCION PARA RESETEAR EL TEMPORIZADOR DE INACTIVIDAD
  const resetInactivityTimer = () => {
    if (isLoggedIn) {
      console.log("Reseteando el temporizador de inactividad...");
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        showInactivityAlert();
      }, INACTIVITY_LIMIT);
    }
  };
  // Función que maneja el cierre de sesión por inactividad
  const handleInactivityLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/usuarios/Delete/login",
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );
      setIsLoggedIn(false);
      setUser(null);
      setShowCountdown(false);
      navigate("/login");
      toast.info("Tu sesión ha sido cerrada por inactividad.");
    } catch (error) {
      console.error("Error cerrando sesión por inactividad:", error);
    }
  };

  // Función que muestra la alerta de inactividad
  const showInactivityAlert = () => {
    let timeLeft = 10;
    Swal.fire({
      title: "Inactividad detectada",
      html: `Tu sesión se cerrará en <strong>${timeLeft}</strong> segundos debido a inactividad.`,
      icon: "warning",

      timer: ALERT_TIMEOUT,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        countdownTimer = setInterval(() => {
          timeLeft--;
          Swal.getHtmlContainer().querySelector("strong").textContent =
            timeLeft;
        }, 1000);
      },
      willClose: () => {
        clearInterval(countdownTimer);
        handleInactivityLogout();
      },
      customClass: {
        popup: "small-swal",
        title: "small-title",
        content: "small-content",
      },
      width: "300px",
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log("Sesión cerrada por inactividad");
      }
    });
  };

  // useEffect que maneja los eventos de actividad (movimiento del ratón, teclado)
  useEffect(() => {
    if (isLoggedIn) {
      console.log("Comenzando a escuchar eventos de inactividad...");
      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keypress", resetInactivityTimer);
      resetInactivityTimer();

      return () => {
        clearTimeout(inactivityTimer);
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("keypress", resetInactivityTimer);
      };
    }
  }, [isLoggedIn]);

  ///DATOS DE LA EMPRESA
  useEffect(() => {
    const fetchDatosEmpresa = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/empresa");
        setDatosEmpresa(response.data);
      } catch (error) {
        console.error("Error al obtener los datos de la empresa:", error);
      }
    };
    fetchDatosEmpresa();
  }, []);

  //==================================================================================================================================

  //REalizamos la cosulta general de los usuarios
  useEffect(() => {
    console.log("Este es lo que me obtiene user", user);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: "Inicio", href: "/" },
    { text: "Catálogo", href: "/#" },
    { text: "Servicios", href: "/#" },
    { text: "Contacto", href: "/#" },
    { text: "Cotiza Ahora", href: "/#" },
  ];

  return (
    <Box
      sx={{
        bgcolor: theme === "light" ? "background.paper" : "grey.900",
        color: theme === "light" ? "text.primary" : "text.secondary",
      }}
    >
      {/* Información de contacto */}
      {datosEmpresa && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: theme === "light" ? "#D4A017" : "black",
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
            <Typography>
              Llámamos: {datosEmpresa.telefono || "(123) 456-7890"}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ mx: 2, fontWeight: "bold", textAlign: "center" }}
          >
            {datosEmpresa.slogan || "Tu evento, nuestra prioridad"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mx: 2 }}>
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              style={{ marginRight: "8px", color: "red" }}
            />
            <Typography>
              Ubicación: {datosEmpresa.direccion || "Ciudad XYZ"}
            </Typography>
          </Box>
        </Box>
      )}

      {/**====================================================================0000000 */}
      {/* Menú de navegación */}

      <>
        {/* Barra de navegación principal */}
        <AppBar
          position="static"
          sx={{ bgcolor: theme === "light" ? "grey.200" : "black.1000" }}
        >
          {user?.rol !== "Administrador" ? (
            <>
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Logo de la empresa */}

                <div
                  className="title-container"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {datosEmpresa?.logo_url ? (
                    <img
                      src={datosEmpresa.logo_url}
                      alt="Logo de la empresa"
                      style={{
                        height: "30px",
                        width: "30px",
                        marginRight: "10px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      style={{
                        fontSize: "24px",
                        color: "#1976d2",
                        marginRight: "10px",
                      }}
                    />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", md: "1.5rem" },
                    }}
                  >
                    <Link
                      to="/"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      ALQUILADORA ROMERO
                    </Link>
                  </Typography>
                </div>

                {/**====================================================================0000000 */}
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
                    className="search-input"
                    style={{
                      backgroundColor: theme === "light" ? "#fff" : "#333",
                      color: theme === "light" ? "#000" : "#fff",
                      border:
                        theme === "light" ? "1px solid #ccc" : "1px solid #444",
                    }}
                  />

                  <IconButton sx={{ position: "absolute", right: 0 }}>
                    <FontAwesomeIcon icon={faSearch} />
                  </IconButton>
                </Box>

                {/* Iconos de usuario, favoritos y carrito */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {user ? (
                    user?.rol && user.rol !== "Administrador" ? (
                      user?.rol === "Cliente" ? (
                        <InconoPerfil />
                      ) : (
                        <InconoHeaderComedor
                          nombreCompleto={user?.nombre || "Invitado"}
                        />
                      )
                    ) : (
                      <LoginLink />
                    )
                  ) : (
                    <LoginLink />
                  )}

                  <IconButton
                    sx={{
                      color: theme === "light" ? "text.primary" : "white",
                      fontSize: { xs: "1rem", md: "1.5rem" },
                    }}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </IconButton>

                  <IconButton onClick={toggleTheme}>
                    <FontAwesomeIcon
                      icon={theme === "light" ? faMoon : faSun}
                      style={{ color: theme === "light" ? "#333" : "#FFD700" }}
                    />
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
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                  flexGrow: 1,
                }}
              >
                <IconButton onClick={toggleTheme}>
                  <FontAwesomeIcon
                    icon={theme === "light" ? faMoon : faSun}
                    style={{ color: theme === "light" ? "#333" : "#FFD700" }}
                  />
                </IconButton>
              </Box>
            </>
          )}
        </AppBar>

        {/* Drawer para el menú de hamburguesa */}
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
          <Box
            sx={{
              width: "250px",
              padding: 2,
              bgcolor: theme === "light" ? "grey.200" : "grey.900",
              color: theme === "light" ? "text.primary" : "text.secondary",
            }}
          >
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
                    sx={{
                      color:
                        theme === "light" ? "text.primary" : "text.secondary",
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
          </Box>
        </Drawer>
      </>
    </Box>
  );
};

export default Header;
