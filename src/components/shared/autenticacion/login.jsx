import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/login.css";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, CircularProgress, TextField, Button }  from "@mui/material";
import { IconButton } from "@mui/material";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useAuth } from "../layaouts/AuthContext";
import { ThemeContext } from "../../shared/layaouts/ThemeContext"; 

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
  const [usuraioC,setUsuarioC]=useState([]);
  const { theme } = useContext(ThemeContext);
  const recaptchaRef = useRef(null);
    // Estado para almacenar el token CSRF
    const [csrfToken, setCsrfToken] = useState("");
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaToken, setMfaToken] = useState(""); // Para el código MFA
    const [userId, setUserId] = useState(""); // 


    useEffect(() => {
      const fetchCsrfToken = async () => {
        try {
          const response = await axios.get("http://localhost:3001/api/get-csrf-token", {
            withCredentials: true, 
          });
          setCsrfToken(response.data.csrfToken); 
        } catch (error) {
          console.error("Error al obtener el token CSRF", error);
        }
      };
  
      fetchCsrfToken();
    }, []);
 
  //funcion para show password or cult 
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Función para manejar el CAPTCHA
  const handleCaptchaChange = (value) => {
    setCaptchaToken(value);
    setCaptchaValid(!!value);
    setErrorMessage(""); 
  };

  const handleCaptchaError = () => {
    setErrorMessage("Hubo un problema con el CAPTCHA, por favor intenta nuevamente.");
    setCaptchaValid(false); 
  };

  const handleCaptchaExpire = () => {
    setErrorMessage("El CAPTCHA ha expirado. Refrescando...");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset(); 
    }
  };

  //================================Enviar datos a back=================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (isBlocked) {
      setErrorMessage("Cuenta bloqueada. Espera 10 minutos.");
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
        tokenMFA : mfaToken,
          
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, 
          },
          withCredentials: true, 
          timeout: 10000,
        }
      );
      const user = response.data?.user;
      setUserId(response.data.userId);
      setUsuarioC(user);
      if (response.data.mfaRequired) {
        setMfaRequired(true);
        return;
      }

      if (user) {
        console.log("Usuario obtenido:", user);
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        
        // Redirigir según el rol del usuario
        if (user.rol === "Administrador") {
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
              console.log("Dirigiendo a administrador");
              navigate("/Administrador");
            },
          });
        } else if (user.rol === "Cliente") {
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
              console.log("Dirigiendo a cliente");
              navigate("/cliente");
            },
          });
        } else {
          
          setErrorMessage("Rol no reconocido.");
        }
      } else {
        setErrorMessage("No se pudo obtener el usuario.");
      }
    
    } catch (error) {
      console.error("Error durante el login:", error);

      if (error.code === "ECONNABORTED") {
        setErrorMessage("La solicitud tardó demasiado. Inténtalo de nuevo.");
      } else if (error.response) {
        if (error.response.status === 403) {
          setIsBlocked(true);
          setErrorMessage("Dispositivo bloqueado. Por favor, espera 10 minutos.");
        } else if (error.response.status === 401) {
          setErrorMessage("Correo o contraseña incorrectos.");
        } else {
          setErrorMessage("Ocurrió un error inesperado.");
        }
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
      }

      // Restablecemos el captcha
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  //=================================================================================================
 // Función para enviar el código MFA
 const handleMfaSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage(""); 
  
  try {
    setIsLoading(true);

    // Realizamos la solicitud al backend para verificar el código MFA
    const response = await axios.post(
      "http://localhost:3001/api/usuarios/login",
      {
        email: correo,
        contrasena: contrasena,
        tokenMFA: mfaToken 
      },
      {
        headers: {
          "X-CSRF-Token": csrfToken, 
        },
        withCredentials: true,
        timeout: 10000,
      }
    );

    // Si la verificación del MFA fue exitosa, recibimos el usuario en la respuesta
    const user = response.data?.user;

    if (user) {
      // Guardamos el usuario en el contexto o en el estado global
      setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
      setIsLoggedIn(true); 

      // Redirigimos según el rol del usuario
      if (user.rol === "Administrador") {
        Swal.fire({
          title: "¡Código MFA correcto!",
          text: "Bienvenido.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => navigate("/Administrador"),
        });
        
      } else if (user.rol === "Cliente") {
        // Mostramos un mensaje de éxito y redirigimos al área del cliente
        Swal.fire({
          title: "¡Código MFA correcto!",
          text: "Bienvenido.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => navigate("/cliente"),
        });
      }
    } else {
      
      setErrorMessage("Código MFA incorrecto o vencido.");
    }

  } catch (error) {
    console.error("Error durante la verificación MFA:", error);

    if (error.code === "ECONNABORTED") {
      setErrorMessage("La solicitud tardó demasiado. Inténtalo de nuevo.");
    } else if (error.response) {
      setErrorMessage("Código MFA incorrecto o vencido.");
    } else {
      setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
    }
  } finally {
    setIsLoading(false);
  }
};

    

  return (
    <div
      className="login-container"
      style={{
        backgroundColor: theme === "light" ? "#f5f5f5" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        paddingBottom: "80px",
      }}
    > 
      {mfaRequired ? (
        <div className="login-box">
          <h2 className="login-title">Autenticación MFA</h2>
          {errorMessage && (
        <Box sx={{ marginBottom: 2, textAlign: "center" }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}
          <form onSubmit={handleMfaSubmit}>
            <TextField
              label="Código MFA"
              variant="outlined"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              fullWidth
              required
              sx={{ marginBottom: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Verificando...{" "}
                  <CircularProgress size={20} sx={{ color: "white", marginLeft: "10px" }} />
                </>
              ) : (
                "Verificar Código"
              )}
            </Button>
          </form>
        </div>
      ) : (


     <div
        className={`login-box ${isBlocked || isLoading ? "disabled" : ""}`}
        style={{
          backgroundColor: theme === "light" ? "#fff" : "#444",
          color: theme === "light" ? "#000" : "#fff",
          border: theme === "light" ? "1px solid #ddd" : "1px solid #666",
          marginBottom: "20px",
        }}
      >
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
            
            style={{
                backgroundColor: theme === "light" ? "#fff" : "#555",
                color: theme === "light" ? "#000" : "#fff",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #777",
              }}
              />
          </div>

          <div className="form-group">
            <label
              htmlFor="password"
              style={{ color: theme === "light" ? "#000" : "#fff" }}
            >
              Contraseña
            </label>
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
                style={{
                  backgroundColor: theme === "light" ? "#fff" : "#555",
                  color: theme === "light" ? "#000" : "#fff",
                  border:
                    theme === "light" ? "1px solid #ccc" : "1px solid #777",
                }}
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
                  color: theme === "light" ? "#000" : "#fff",
                }}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  style={{ color: theme === "light" ? "#000" : "#fff" }}
                />
              </IconButton>
            </div>
          </div>


          <ReCAPTCHA
           ref={recaptchaRef}
            className="recaptcha-container"
            sitekey="6Le0dGAqAAAAAPQMdd-d6ZH8nZWTgC9HEHpO6R-7"
            onChange={handleCaptchaChange}
            onErrored={handleCaptchaError} 
            onExpired={handleCaptchaExpire} 
            disabled={isBlocked || isLoading}
            style={{ marginBottom: "20px", transform: "scale(0.9)" }} 
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
          <Link to="/recuperarPass">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
      )}
    </div>
          
  );
};

export default Login;
