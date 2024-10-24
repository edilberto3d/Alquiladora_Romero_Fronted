import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, IconButton, TextField, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom"; // Para redirigir
import Swal from "sweetalert2";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // Importar la función para generar UUID




const ModalPassword = ({open, onClose, usuario}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [csrfToken, setCsrfToken] = useState(""); // Estado para almacenar el token CSRF
  const [tokenValido, setTokenValido] = useState(""); // Estado para almacenar el token generado
  const navigate = useNavigate(); 
  const theme = useTheme();


  // Estilos responsivos del modal
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: theme.palette.background.paper, // Cambiar el fondo según el tema
  color: theme.palette.text.primary, // Cambiar el color del texto según el tema
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxWidth: "500px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
};


  // Recuperar el token CSRF al cargar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/get-csrf-token", { withCredentials: true });
        setCsrfToken(response.data.csrfToken); // Almacenar el token CSRF
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handlePasswordChange = async () => {
    setIsProcessing(true);

    try {
   
      const uuid = uuidv4();  
      const shortUUID = uuid.substring(0, 6); 
      setTokenValido(shortUUID); 

     
      const response = await axios.post("http://localhost:3001/api/email/cambiarpass", 
      { 
        correo: usuario.correo, 
        shortUUID,  
        nombreU: usuario.nombre,
        idUsuario: usuario.id 
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,  
          'Content-Type': 'application/json',
        },
        withCredentials: true, 
      });

    
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Token Enviado",
          text: "Se ha enviado un token a tu correo para cambiar tu contraseña.",
        });

        navigate("/cliente/cambiarPassword", { state: { idUsuario: usuario.id } });
      } else {
        throw new Error("Error al enviar el token.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al enviar el token. Inténtalo nuevamente.",
      });
    } finally {
      setIsProcessing(false);
      onClose(); // Cerramos el modal después del proceso
    }
  };

 

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title">
      <Box sx={style}>
        {/* Botón de cerrar modal */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Título del modal */}
        <Typography id="modal-modal-title" variant="h6" component="h2" align="center" gutterBottom>
          Cambiar Contraseña
        </Typography>

        {/* Mensaje para indicar el proceso */}
        <Typography variant="body1" sx={{ mt: 2 }} align="center">
          Pulsa el botón para realizar el proceso de cambio de contraseña.
        </Typography>

        {/* Campo de correo solo lectura */}
        <TextField
          label="Correo Electrónico"
          value={usuario.correo}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
          sx={{ mt: 2, mb: 4 }}
        />

        {/* Botón para enviar el token */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            disabled={isProcessing}
            fullWidth
          >
            {isProcessing ? "Procesando..." : "Enviar Token"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalPassword;
