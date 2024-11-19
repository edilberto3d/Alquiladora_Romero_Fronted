import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Modal, Box, Button, TextField, Typography, IconButton , useTheme} from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import { Close as CloseIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

export const TokenModalP = () => {
  const [tokens, setTokens] = useState(Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); 
  const inputRefs = useRef([]); 
  const [csrfToken, setCsrfToken] = useState(""); 
  const location = useLocation();
  const { idUsuario, tokenValido } = location.state || {};
  const navigate = useNavigate(); 
  const theme = useTheme();
  
  


  // Recuperar el token CSRF al cargar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", { withCredentials: true });
        setCsrfToken(response.data.csrfToken); // Almacenar el token CSRF
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    fetchCsrfToken();
  }, []);


  
//================================================================================================
const handleTokenChange = (index, value) => {
  const newTokens = [...tokens];
  if (/^[A-Za-z0-9]$/.test(value)) {
    newTokens[index] = value;
    setTokens(newTokens);
    if (index < tokens.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const allTokensFilled = newTokens.every(token => token !== "");
  setIsButtonDisabled(!allTokensFilled || timeLeft <= 0);
};

const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {
    const newTokens = [...tokens];
    if (newTokens[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else {
      newTokens[index] = "";
      setTokens(newTokens);
    }
  }
};

const handleClose = () => {
  navigate("/cliente/perfil");
};



  //=============================================000Enviara en la base dedatos /Validation===============================0
  const handleSubmit =async () => {

    //HACEMOS LA CONSULTA EN LA BASE DE DATOS 
    const tokenValido = tokens.join(""); // Token ingresado

    try {
      const response = await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/validarToken/contrasena", 
        { idUsuario: idUsuario, token: tokenValido },
        {
          headers: {
            "X-CSRF-Token": csrfToken, 
          },
          withCredentials: true, 
        }
      );

      if (response.data.message === "Token válido. Puede proceder con el cambio de contraseña. El token ha sido eliminado.") {
        Swal.fire({
          title: '¡Token Correcto!',
          text: 'El token ha sido validado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Redirigir después de la validación exitosa
          navigate("/updatePass", { state: { idUsuario } });
        });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al validar el token.", "error");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsButtonDisabled(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',  
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem',
        bgcolor: theme.palette.background.default, // Cambia según el tema
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.background.paper, // Cambia según el tema
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)', 
          p: 2.5,
          borderRadius: '16px',
          maxWidth: '350px',
          width: '100%',
          textAlign: 'center',
          color: theme.palette.text.primary, // Color del texto dinámico
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Validar Token</Typography>
          <IconButton onClick={handleClose} sx={{ color: '#f44336' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          sx={{
            marginBottom: '8px',
            fontSize: '0.95rem',
            color: theme.palette.text.secondary,
            fontWeight: '500',
          }}
        >
          Paso 2: Ingresa el token recibido para continuar.
        </Typography>

        {errorMessage && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              color: '#d32f2f',
              backgroundColor: '#fdecea',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: '8px' }} />
            <Typography variant="body2">{errorMessage}</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mb: 2,
            '& .MuiTextField-root': {
              width: { xs: '30px', sm: '35px', md: '40px' },
              height: { xs: '30px', sm: '35px', md: '40px' }, 
              '& .MuiInputBase-input': {
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                padding: { xs: '5px', sm: '8px' },
                textAlign: 'center',
              },
            },
          }}
        >
          {tokens.map((token, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              id={`token-${index}`}
              value={token}
              onChange={(e) => handleTokenChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ maxLength: 1 }}
              variant="outlined"
            />
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
          sx={{
            fontWeight: 'bold',
            padding: { xs: '8px', sm: '10px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Validar Token <FontAwesomeIcon icon={faClock} style={{ marginLeft: '8px' }} />
          {formatTime(timeLeft)}
        </Button>

        <Typography sx={{ textAlign: 'center', marginTop: '8px', fontSize: '0.75rem', color: '#FF5722' }}>
          El token es válido por 10 minutos. {timeLeft === 0 && 'El token ha expirado.'}
        </Typography>
      </Box>
    </Box>
  );
};