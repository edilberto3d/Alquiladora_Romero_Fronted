import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/login.css";
import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import { Alert, Box, Typography } from '@mui/material'; 

const Login = () => {
  const [captchaValid, setCaptchaValid] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();
  
//===========================COKIES==================================================
  //Configuramos un tiempo de inactividad
  const INACTIVITY_LIMIT = 30 *60 *100;
  let inactivityTimer;

  //
  const resetInactivityTimer=()=>{
    clearTimeout(inactivityTimer);
    inactivityTimer= setTimeout(()=>{
      logoutUser();
    }, INACTIVITY_LIMIT);
  }

  useState(()=>{
    //Escucha eventos del usuario (clics, teclas presionadas)
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keypress", resetInactivityTimer);
    //Reseteamos el temporizador al carga la pagina
    resetInactivityTimer();

    //Limpiamos los eventos al desmontar el componenente
    return ()=>{
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keypress", resetInactivityTimer);
    }
  }, []);

  //fUNCIN PARA MENEJAR LA SESION DE CIERRE
  const logoutUser = async ()=>{
    try {
      await axios.post("https://alquiladora-romero-backed-1.onrender.com/api/usuarios//Delete/login", {}, { withCredentials: true });
      navigate("/login");  
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }


  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaValid(true);
    } else {
      setCaptchaValid(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validamos el correo
    if(!correo.trim() || !contrasena.trim()){
      setErrorMessage('Completa todos los campos');
    }


    if (!captchaValid) {
      setErrorMessage("Completa todo los campos");
      return;
    }

    try {
      setIsLoading(true); 

      // HACEMOS UNA SOLICITUD POST AL BACKEND ENVIANDO CORREO Y CONTRASEÑA
      const response = await axios.post("https://alquiladora-romero-backed-1.onrender.com/api/usuarios/login", {
        email: correo,
        contrasena: contrasena,
      },{ withCredentials: true });

      const { rol } = response.data;

      // REDIRECCIONAMOS SEGÚN EL ROL DEL USUARIO
      if (rol === "Administrador") {
        navigate("/admin"); 
      } else if (rol === "Cliente") {
        navigate("/cliente");
      } else {
        setErrorMessage("Rol no reconocido.");
      }

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setErrorMessage("Error: Tiempo de espera agotado. Intenta nuevamente.");
      } else {
        setErrorMessage("Credenciales Inocrrectos.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Bienvenido</h2>
   
        {/* Mensaje de error estilizado con MUI */}
        {errorMessage && (
          <Box sx={{ marginBottom: 2, textAlign: 'center' }}>
            <Alert 
              severity="error" 
              sx={{ 
                bgcolor: 'rgba(255, 0, 0, 0.1)', 
                border: '1px solid red',
                borderRadius: 2,
                padding: '2px 5px',
                typography: 'body2',
                fontWeight: 'bold',
                fontSize: { xs: '0.85rem', sm: '1rem' }, 
                maxWidth: '90%', 
                margin: 'auto',  
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
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <ReCAPTCHA
            className="recaptcha-container"
            sitekey="6Le0dGAqAAAAAPQMdd-d6ZH8nZWTgC9HEHpO6R-7" 
            onChange={handleCaptchaChange}
          />

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="login-links">
          <Link to="/RegistroValidacionCorreo">¿No tienes cuenta? Regístrate</Link>
          <Link to="/forgpassw">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
