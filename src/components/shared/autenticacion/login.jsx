import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/login.css";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, CircularProgress } from "@mui/material";
import { IconButton } from "@mui/material";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useAuth } from "../layaouts/AuthContext";

const Login = () => {
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { setUser } = useAuth();

  // Configuramos un tiempo de inactividad
  const INACTIVITY_LIMIT = 60 * 1000;
  let inactivityTimer;

  // Función para resetear el temporizador
  const resetInactivityTimer = () => {
    if (isLoggedIn) {
      console.log("Reseteando el temporizador...");
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_LIMIT);
    }
  };

  // Función para manejar el cierre de sesión por inactividad
  const handleInactivityLogout = async () => {
    console.log("Cerrando sesión por inactividad...");
    try {
      // Cerrar sesión en el backend
      await axios.post(
        "http://localhost:3001/api/usuarios/Delete/login",
        {},
        { withCredentials: true }
      );

      // Mostrar el mensaje de alerta indicando que la sesión ha caducado
      Swal.fire({
        title: "Sesión cerrada",
        text: "Tus credenciales han caducado debido a la inactividad. Se ha cerrado la sesión.",
        icon: "warning",
        confirmButtonText: "OK",
      }).then(() => {
        setIsLoggedIn(false);
        navigate("/login");
      });
    } catch (error) {
      console.error("Error al cerrar sesión por inactividad", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      console.log("Comenzando a escuchar eventos de inactividad...");
      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keypress", resetInactivityTimer);

      resetInactivityTimer();

      return () => {
        console.log("Limpiando eventos y temporizador...");
        clearTimeout(inactivityTimer);
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("keypress", resetInactivityTimer);
      };
    }
  }, [isLoggedIn]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Función para manejar el CAPTCHA
  const handleCaptchaChange = (value) => {
    setCaptchaToken(value);
    setCaptchaValid(!!value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isBlocked) {
      setErrorMessage(
        "Este dispositivo está bloqueado. Por favor, espera 10 minutos para intentarlo de nuevo."
      );
      return;
    }

    if (!correo.trim() || !contrasena.trim()) {
      setErrorMessage("Completa todos los campos");
      return;
    }

    if (!captchaValid) {
      setErrorMessage("Completa el captcha");
      return;
    }

    try {
      setIsLoading(true);
      // Hacemos una solicitud POST
      const response = await axios.post(
        "http://localhost:3001/api/usuarios/login",
        {
          email: correo,
          contrasena: contrasena,
        },
        { withCredentials: true }
      );
      console.log("Este es el resoltado de login ", response.data);

      const { user } = response.data;
      setUser(user);
      console.log("Este es el resoltado de login de rol", { user });

      setIsLoggedIn(true);

      // Redireccionamos según el rol del usuario
      if (user.Rol === "Administrador") {
        navigate("/admin");
      } else if (user.Rol === "Cliente") {
        Swal.fire({
          title: "¡Inicio de sesión correcto!",
          text: "Bienvenido.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "small-swal",
          },
          willClose: () => {
            console.log("La alerta se ha cerrado automáticamente");
            console.log("Dirigiendo a cliente");
            navigate("/cliente");
          },
        });
      } else {
        setErrorMessage("Rol no reconocido.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          setIsBlocked(true);
          setErrorMessage(
            "Dispositivo bloqueado. Por favor, espera 10 minutos."
          );
        } else if (error.response.status === 401) {
          setErrorMessage("Correo o contraseña incorrectos.");
        } else {
          setErrorMessage("Ocurrió un error inesperado.");
        }
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`login-box ${isBlocked || isLoading ? "disabled" : ""}`}>
        <h2 className="login-title">Bienvenido</h2>

        {errorMessage && (
          <Box sx={{ marginBottom: 2, textAlign: "center" }}>
            <Alert
              severity="error"
              sx={{
                bgcolor: "rgba(255, 0, 0, 0.1)",
                border: "1px solid red",
                borderRadius: 2,
                padding: "2px 5px",
                fontWeight: "bold",
                fontSize: { xs: "0.85rem", sm: "1rem" },
                maxWidth: "90%",
                margin: "auto",
              }}
            >
              {errorMessage}
            </Alert>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              value={correo}
              disabled={isBlocked || isLoading}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className={isBlocked || isLoading ? "disabled-input" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Ingresa tu contraseña"
                disabled={isBlocked || isLoading}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className={isBlocked || isLoading ? "disabled-input" : ""}
              />
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                edge="end"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </IconButton>
            </div>
          </div>

          <ReCAPTCHA
            className="recaptcha-container"
            sitekey="6Le0dGAqAAAAAPQMdd-d6ZH8nZWTgC9HEHpO6R-7"
            onChange={handleCaptchaChange}
            disabled={isBlocked || isLoading}
          />

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading || isBlocked}
            style={{
              backgroundColor: isLoading || isBlocked ? "#c0c0c0" : "#1976d2",
              color: isLoading || isBlocked ? "#808080" : "#fff",
            }}
          >
            {isLoading ? (
              <>
                Cargando...{" "}
                <CircularProgress
                  size={20}
                  sx={{ color: "white", marginLeft: "10px" }}
                />
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="login-links">
          <Link to="/RegistroValidacionCorreo">
            ¿No tienes cuenta? Regístrate
          </Link>
          <Link to="/forgpassw">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
