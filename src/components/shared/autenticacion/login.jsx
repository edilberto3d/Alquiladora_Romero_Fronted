import React, { useState, useRef, useContext, useEffect } from "react";
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
  const { theme } = useContext(ThemeContext);
  const recaptchaRef = useRef(null);
    // Estado para almacenar el token CSRF
    const [csrfToken, setCsrfToken] = useState("");
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaToken, setMfaToken] = useState(""); // Para el código MFA


    useEffect(() => {
      const fetchCsrfToken = async () => {
        try {
          const response = await axios.get("http://localhost:3001/api/get-csrf-token", {
            withCredentials: true, // Para asegurarse de que las cookies de CSRF se envíen
          });
          setCsrfToken(response.data.csrfToken); // Guardar el token CSRF en el estado
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
    setErrorMessage("El CAPTCHA ha expirado, por favor recárgalo e inténtalo de nuevo.");
    setCaptchaValid(false); // Si expira, invalidamos el CAPTCHA
    if (recaptchaRef.current) {
      recaptchaRef.current.reset(); // Reseteamos el CAPTCHA si expira
    }
  };

  //================================Enviar datos a back=================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
       //Verfiicamos si no esta bloqueado 
    if (isBlocked) {
      setErrorMessage(
        "Esta cuenta esta bloqueado Por  favor, espera 10 minutos para intentarlo de nuevo."
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

      // Si MFA ya fue solicitado, enviamos el código MFA también
    
      const loginData = {
        email: correo,
        contrasena: contrasena,
      };
      
      // Si MFA es requerido, agregamos el token MFA al objeto loginData
      if (mfaRequired) {
        loginData.tokenMFA = mfaToken; // El backend espera recibir tokenMFA
      }


      // Hacemos una solicitud POST
      const response = await axios.post(
        "http://localhost:3001/api/usuarios/login",
        {
          email: correo,
        contrasena: contrasena,
     okenMFA : mfaToken,
          
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, 
          },
          withCredentials: true, // Para enviar las cookies de sesión junto con la solicitud
        }
      );
      
      
      console.log("Este es el resultado del login:", response.data);
    
      const user = response.data?.user;

      if (response.data.mfaRequired) {
        // Si se requiere MFA, pedimos el código al usuario
        setMfaRequired(true); // Activar el estado para mostrar el input de MFA
        setErrorMessage("Se requiere autenticación multifactor (MFA). Ingresa el código MFA de tu aplicación.");
        return;
      }
    
      if (user) {
        console.log("Usuario obtenido:", user);
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        
        // Redirigir según el rol del usuario
        if (user.rol === "Administrador") {
          navigate("/admin");
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
      if (error.response) {
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

{mfaRequired && (
  <div className="form-group">
    <label htmlFor="mfaToken">Código MFA</label>
    <input
      type="text"
      id="mfaToken"
      placeholder="Ingresa el código MFA"
      value={mfaToken}
      onChange={(e) => setMfaToken(e.target.value)}
      required
    />
  </div>
)}


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
          <Link to="/forgpassw">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
