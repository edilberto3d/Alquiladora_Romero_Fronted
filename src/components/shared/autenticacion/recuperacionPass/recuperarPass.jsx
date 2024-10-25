import React, { useState, useEffect, useRef } from "react";
import { faEnvelope, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CryptoJS from 'crypto-js';
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom"; 
import Swal from "sweetalert2";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Container, Box, TextField, Button, CircularProgress, Alert, AlertTitle, Typography, useTheme } from "@mui/material";

export const ValidarCorreoRecuperacion = () => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [email, setEmail] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [usuarioE, setUsuarioE]= useState([]);
  const [loading, setLoading] = useState(false);
  const secretKey = 'TokenValidation2024';
  const recaptchaRef = useRef(null);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate(); 

  const theme = useTheme(); // Acceso al tema actual (oscuro o claro)

  // Obtener usuarios y el token CSRF
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/get-csrf-token', { withCredentials: true });
        setCsrfToken(response.data.csrfToken); 
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    

    const ConsultarUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar los usuarios: ", error);
      }
    };
    getCsrfToken();
    ConsultarUsuarios();
  }, []);

  // Manejo de CAPTCHA
  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
    setErrorMessage("");
  };

  const handleCaptchaError = () => {
    setErrorMessage("Error al cargar el reCAPTCHA, por favor intenta de nuevo.");
  };



  // Encriptar el token
  const storeEncryptedToken = (token) => {
    const expirationTime = new Date().getTime() + 15 * 60 * 1000; 
    const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
    localStorage.setItem("encryptedToken", encryptedToken);
    localStorage.setItem("tokenExpiration", expirationTime);
  };

  // Validar correo y CAPTCHA antes de enviar
  const handleValidation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!captchaValue) {
      setErrorMessage("Por favor completa el reCAPTCHA.");
      setLoading(false);
      return;
    }


  // Validar si el correo electrónico existe en la base de datos
  const usuarioEncontrado = usuarios.find((usuario) => {
    const correoBD = usuario.Correo.toLowerCase().trim();  // Correo en la BD en minúsculas y sin espacios
    const correoInput = email.toLowerCase().trim();  // Correo ingresado en minúsculas y sin espacios
    return correoBD === correoInput;
  });
  
    
  if (!usuarioEncontrado) {
    setErrorMessage("Este correo no está registrado.");
    setLoading(false);
    return;
  }
  setUsuarioE(usuarioEncontrado.idUsuarios);

    const shortUUID = uuidv4().substring(0, 6);
   
    try {
      storeEncryptedToken(shortUUID);
      await axios.post(
        "http://localhost:3001/api/email/cambiarpass",
        {
          correo: email,
          shortUUID: shortUUID,
          nombreU:  usuarioEncontrado.Nombre,
          idUsuario: usuarioEncontrado.idUsuarios,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,  
          },
          withCredentials: true,
        }
      );

      Swal.fire({
        icon: 'success',
        title: '¡Token enviado al correo!',
        showConfirmButton: true,
        customClass: {
          popup: 'small-swal' 
        }
      });
      navigate("/tokenPassword", { state: { idUsuario: usuarioEncontrado.idUsuarios } });

    } catch (error) {
      console.error("Error al procesar la solicitud:", error.message);
      setErrorMessage("Lo sentimos, vuelve a intentar más tarde.");
      recaptchaRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="sm"
      sx={{
        margin: '20px auto',  // Margin centrado
        backgroundColor: theme.palette.mode === 'dark' ? "#333" : "#fff", // Modo oscuro o claro
        color: theme.palette.mode === 'dark' ? "#fff" : "#000",
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <Box mt={3} p={3} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Paso 1: Ingresa tu correo
        </Typography>

        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, fontSize: '0.875rem', padding: '10px' }}  // Tamaño de error pequeño
          >
            <AlertTitle sx={{ fontSize: '0.95rem' }}>Error</AlertTitle>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleValidation}>
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
            }}
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? "#555" : "#f0f0f0",
              borderRadius: '5px'
            }}
          />

          <Box mt={2} mb={2} display="flex" justifyContent="center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Le0dGAqAAAAAPQMdd-d6ZH8nZWTgC9HEHpO6R-7"
              onChange={onCaptchaChange}
              onErrored={handleCaptchaError}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <FontAwesomeIcon icon={faCheckCircle} />}
            sx={{ mt: 2 }}
          >
            {loading ? "Validando..." : "Validar"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};
