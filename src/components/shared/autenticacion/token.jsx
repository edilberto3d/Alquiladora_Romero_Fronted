import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2';

export const Token = ({ onValidationSuccess }) => {
  const [tokens, setTokens] = useState(Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(900); // 900 segundos = 15 minutos
  const secretKey = "TokenValidation2024"; 
  const [tokenRecuperado, setTokenRecuperado] = useState(null);

  const inputRefs = useRef([]); // Referencias a los campos de texto

  //======================================================================================
  // Función para recuperar el token encriptado
  const getDecryptedToken = () => {
    const encryptedToken = localStorage.getItem("encryptedToken");
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    
    // Verificar si el token ha expirado
    if (!encryptedToken || !tokenExpiration || new Date().getTime() > tokenExpiration) {
      localStorage.removeItem("encryptedToken");
      localStorage.removeItem("tokenExpiration");
      return null;
    }
    // Desencriptar el token
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedToken;
  };

  // Usamos useEffect para recuperar el token cuando el componente se monte
  useEffect(() => {
    const recoveredToken = getDecryptedToken();
    if (recoveredToken) {
      setTokenRecuperado(recoveredToken); 
    } else {
      console.error("El token ha expirado o no existe.");
    }
  }, []);

  //======================================================================================
  // Maneja el cambio de valor en los inputs de tokens (letras y números permitidos)
  const handleTokenChange = (index, value) => {
    const newTokens = [...tokens];
    
    // Si el valor ingresado es un alfanumérico, lo asigna y avanza
    if (/^[A-Za-z0-9]$/.test(value)) {
      newTokens[index] = value;
      setTokens(newTokens);

      // Mueve el foco al siguiente campo si no es el último
      if (index < tokens.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Habilitar el botón solo si todos los tokens están completos
    const allTokensFilled = newTokens.every(token => token !== "");
    setIsButtonDisabled(!allTokensFilled || timeLeft <= 0);
  };

  // Maneja las teclas presionadas en los inputs
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newTokens = [...tokens];

      // Si el campo actual está vacío, retrocede al campo anterior
      if (newTokens[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        newTokens[index] = ""; // Borra el valor actual
        setTokens(newTokens);
      }
    }
  };


  const handleSubmit = () => {
    if (tokens.join("") === tokenRecuperado) { 
      setErrorMessage("");
      Swal.fire({
        title: '¡Token Correcto!',
        text: 'El token ha sido validado correctamente.',
        icon: 'success', // Icono de éxito
        timer: 2000, // Se cierra automáticamente después de 2 segundos
        showConfirmButton: false, // No mostrar el botón de confirmación
        customClass: {
          popup: 'small-swal', // Clase personalizada para un tamaño reducido (opcional)
        },
        willClose: () => {
          console.log('La alerta se ha cerrado automáticamente'); // Acción adicional al cerrar
        },
      });

      if(onValidationSuccess){
        onValidationSuccess();
      }

    } else {
      setErrorMessage("Token inválido, vuelve a intentarlo.");

    }
  };

  // Función para calcular el tiempo restante en minutos y segundos
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Efecto para contar hacia atrás el tiempo del token
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsButtonDisabled(true); // Deshabilitar el botón cuando el tiempo se agote
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Limpiar el intervalo cuando el componente se desmonte
  }, []);

  return (
    <>
      <div>
        <h2 className="login-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
          Paso 2: Validar Token
        </h2>
         
        {errorMessage && (
          <div className="custom-alert-error" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: 'red' }}>
            <FontAwesomeIcon icon={faExclamationCircle} className="alert-icon" style={{ marginRight: '8px' }} />
            <span className="alert-title">Error:</span>
            <span className="alert-message">{errorMessage}</span>
          </div>
        )}
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 3,
            '& .MuiTextField-root': {
              width: { xs: '35px', sm: '40px', md: '45px' },
              height: { xs: '35px', sm: '40px', md: '45px' },
              '& .MuiInputBase-input': {
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                padding: { xs: '6px', sm: '10px' },
                textAlign: 'center',
              },
            },
          }}
        >
          {tokens.map((token, index) => (
            <TextField
              key={index}
              inputRef={(el) => inputRefs.current[index] = el} // Guardamos la referencia
              id={`token-${index}`}
              value={token}
              onChange={(e) => handleTokenChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ maxLength: 1 }}
              variant="outlined"
              autoFocus={index === 0} // Solo el primer input tiene autofoco
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
            padding: { xs: '10px', sm: '12px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Validar Token 
          <FontAwesomeIcon icon={faClock} style={{ marginLeft: '10px' }} /> 
          {formatTime(timeLeft)}
        </Button>

        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.875rem', color: '#FF5722' }}>
          El token es válido por 15 minutos. {timeLeft === 0 && 'El token ha expirado.'}
        </p>
      </div>
    </>
  );
};
