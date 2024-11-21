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
          //Extraemos el token
          const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", {
            withCredentials: true, 
          });
          setCsrfToken(response.data.csrfToken); 
        } catch (error) {
         
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


  //=======================================================================
  //Obtenemos el tipo de dispositivo
  const getDeviceType = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
      return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }
    if (/Windows NT/.test(userAgent)) {
      return "Windows";
    }
    return "Unknown";
  };

  //=====================================================================AUDITORIA DE LOGUEO=========
  const registrarAuditoria = async (usuario, correo, accion, dispositivo, detalles) => {
    
    const fecha_hora = new Date().toISOString();
    const ip = await obtenerIPUsuario(); 
  
    try {
      await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/auditoria",
        {
          usuario,
          correo,
          accion,
          dispositivo,
          ip,
          fecha_hora,
          detalles,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, 
          },
          withCredentials: true, 
          timeout: 30000,
        }
      );
    } catch (error) {
      console.error("Error al enviar datos de auditoría:", error);
    }
  };
  
  //======================================================================================
  // Función para obtener la IP del usuario
  const obtenerIPUsuario = async () => {
    try {
      const response = await axios.get("https://api64.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error al obtener la IP del usuario:", error);
      return "Desconocido";
    }
  };
  




  //================================Enviar datos a back=================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    //Obtenemos el tipo de dispositivo
    const deviceType = getDeviceType();
    //Obtenemos el tiempo
    const deviceTime = new Date().toISOString();
    
    if (isBlocked) {
      setErrorMessage("Cuenta bloqueada. Espera 10 minutos.");
      await registrarAuditoria("Desconocido", correo, "Intento fallido: cuenta bloqueada", deviceType, "Cuenta bloqueada por múltiples intentos");
      return;
    }

    if (!correo.trim() || !contrasena.trim()) {
      setErrorMessage("Completa todos los campos");
      await registrarAuditoria("Desconocido", correo, "Intento fallido: campos vacíos", deviceType, "Campos de inicio de sesión incompletos");
      return;
    }

    if (!captchaValid) {
      setErrorMessage("Completa el captcha");
      await registrarAuditoria("Desconocido", correo, "Intento fallido: CAPTCHA no completado", deviceType, "CAPTCHA no completado por el usuario");
      return;
    }

    try {
      setIsLoading(true);
      // Hacemos una solicitud POST
     
      const response = await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/login",
        {
        email: correo,
        contrasena: contrasena,
        tokenMFA : mfaToken,
        clientTimestamp: deviceTime,
        deviceType: deviceType 
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, 
          },
          withCredentials: true, 
          timeout: 30000,
        }
      );
      const user = response.data?.user;
      setUserId(response.data.userId);
      setUsuarioC(user);
      if (response.data.mfaRequired) {
        setMfaRequired(true);
        await registrarAuditoria(user ? user.nombre : "Desconocido", correo, "MFA requerido", deviceType, "Autenticación multifactor requerida");
        return;
      }

      if (user) {
        console.log("Usuario obtenido:", user);
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        await registrarAuditoria(user.nombre, correo, "Inicio de sesión exitoso", deviceType, "Usuario autenticado correctamente");
        
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
  
      // Manejo de errores
      if (error.code === "ECONNABORTED") {
        console.error("Error durante el login:",error.code);
        setErrorMessage("La solicitud tardó demasiado. Inténtalo de nuevo.");
        await registrarAuditoria("Desconocido", correo, "Error: Tiempo de solicitud excedido", deviceType, "La solicitud de inicio de sesión tardó demasiado");
      
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data.message || "Error desconocido.";
  
        switch (status) {
          case 400:
            setErrorMessage(serverMessage);
            await registrarAuditoria("Desconocido", correo, `Error 400: ${serverMessage}`, deviceType, "Solicitud inválida");
            break;
          case 401:
            setErrorMessage(serverMessage);
            await registrarAuditoria("Desconocido", correo, `Error 401: ${serverMessage}`, deviceType, "Credenciales incorrectas o autenticación requerida");
            break;
          case 403:
            setIsBlocked(true);
           
           setErrorMessage(serverMessage);
          
            await registrarAuditoria("Desconocido", correo, `Error 403: ${serverMessage}`, deviceType, "Acceso denegado o dispositivo bloqueado");
            break;
          case 500:
            setErrorMessage("Error del servidor. Por favor, intenta más tarde.");
            await registrarAuditoria("Desconocido", correo, "Error 500: Error interno del servidor", deviceType, "Error en el servidor");
            break;
          default:
            setErrorMessage(serverMessage);
            await registrarAuditoria("Desconocido", correo, `Error ${status}: ${serverMessage}`, deviceType, "Error desconocido");
            break;
        }
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
        await registrarAuditoria("Desconocido", correo, "Error de conexión", deviceType, "No se pudo conectar al servidor");
      }
  
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
  const deviceType = getDeviceType();
  const deviceTime = new Date().toISOString(); 
  
  try {
    setIsLoading(true);
  

    // Realizamos la solicitud al backend para verificar el código MFA
    const response = await axios.post(
      "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/login",
      {
        email: correo,
        contrasena: contrasena,
        tokenMFA: mfaToken ,
        clientTimestamp: deviceTime,
        deviceType: deviceType
      },
      {
        headers: {
          "X-CSRF-Token": csrfToken, 
        },
        withCredentials: true,
        timeout: 30000,
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
        className={`login-box ${isBlocked || isLoading ? "disabled" : ""}}`}
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
