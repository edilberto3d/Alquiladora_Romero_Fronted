import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, Switch, FormControlLabel, Box } from '@mui/material';
import axios from 'axios';

const MFAComponent = ({ userId }) => {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaActivated, setMfaActivated] = useState(false);
  const [csrfToken, setCsrfToken] = useState(""); // CSRF token para proteger las solicitudes

  // Obtener el token CSRF al montar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/get-csrf-token", {
          withCredentials: true, // Para asegurar que las cookies se envíen
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF", error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Función para habilitar MFA y obtener el código QR del backend
  const handleEnableMFA = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/mfa/enable-mfa',
        { userId: userId }, // Enviar el ID de usuario
        {
          headers: {
            'X-CSRF-Token': csrfToken, // Incluir el token CSRF en la solicitud
          },
          withCredentials: true, // Enviar cookies con la solicitud
        }
      );
      setQrCodeUrl(response.data.qrCode); // Obtener la URL del código QR
      setOpenModal(true); // Abrir el modal para mostrar el código QR
    } catch (error) {
      console.error('Error al habilitar MFA:', error);
    }
  };

  // Función para verificar el código MFA introducido por el usuario
  const handleVerifyMFA = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/mfa/verify-mfa',
        {
          userId: userId,  // Enviar el ID de usuario
          token: verificationCode,  // Enviar el código MFA introducido por el usuario
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,  // Incluir el token CSRF
          },
          withCredentials: true,  // Enviar cookies con la solicitud
        }
      );
  
      if (response.data.message === 'Código MFA verificado correctamente.') {
        setMfaActivated(true);
        setOpenModal(false);  // Cerrar el modal tras la verificación exitosa
      } else {
        alert('Código incorrecto, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al verificar MFA:', error);
    }
  };

  // Función para manejar el cambio del switch MFA
  const handleMfaToggle = async (e) => {
    setIsMfaEnabled(e.target.checked);
    if (e.target.checked) {
      handleEnableMFA(); // Si el switch se activa, habilitar MFA
    } else {
      // Deshabilitar MFA si el switch se desactiva
      try {
        await axios.post(
          'http://localhost:3001/api/mfa/disable-mfa',
          { userId: userId }, // Enviar el ID de usuario
          {
            headers: {
              'X-CSRF-Token': csrfToken, // Incluir el token CSRF
            },
            withCredentials: true, // Enviar cookies con la solicitud
          }
        );
        setMfaActivated(false); // Actualizar el estado después de deshabilitar MFA
      } catch (error) {
        console.error('Error al deshabilitar MFA:', error);
      }
    }
  };

  return (
    <div>
      {/* Switch de MFA */}
      <Typography variant="h6">Autenticación Multifactor</Typography>
      <FormControlLabel
        control={<Switch checked={isMfaEnabled} onChange={handleMfaToggle} color="primary" />}
        label={
          isMfaEnabled
            ? 'Autenticación multifactor activada'
            : 'Autenticación multifactor desactivada'
        }
      />

      {/* Modal para mostrar el código QR */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
          <Typography variant="h6">Escanea el código QR para activar MFA</Typography>
          {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" /> : <p>Cargando QR...</p>}
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Introduce el código MFA"
          />
          <Button variant="contained" onClick={handleVerifyMFA}>
            Verificar MFA
          </Button>
        </Box>
      </Modal>

      {mfaActivated && <p>MFA ha sido activado exitosamente.</p>}
    </div>
  );
};

export default MFAComponent;
