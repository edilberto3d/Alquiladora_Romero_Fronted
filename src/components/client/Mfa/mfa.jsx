import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Box,
  TextField,
  CircularProgress,
} from '@mui/material';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const MFAComponent = ({ userId, }) => {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const toast = React.useRef(null);

  // Obtener el token CSRF y el estado MFA al montar el componente
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

    const checkMfaStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/mfa/mfa-status/${userId}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });
        setIsMfaEnabled(response.data.mfaEnabled);
      } catch (error) {
        console.error("Error al obtener el estado MFA:", error);
      }
    };

    if (csrfToken) {
      checkMfaStatus();
    } else {
      fetchCsrfToken();
    }
  }, [csrfToken, userId]);

 
  const handleEnableMFA = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3001/api/mfa/enable-mfa',
        { userId: userId },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      setQrCodeUrl(response.data.qrCode);
      setOpenModal(true); 
     
      toast.current.show({ severity: 'info', summary: 'QR Generado', detail: 'Escanea el código QR con tu app de autenticación.', life: 5000 });
    } catch (error) {
      console.error('Error al habilitar MFA:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo habilitar MFA.', life: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar el código MFA
  const handleVerifyMFA = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/mfa/verify-mfa',
        {
          userId: userId,        
          token: verificationCode 
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
  
      // Si el código es válido, activa MFA
      if (response.data.message === 'Código MFA verificado correctamente.') {
        setIsMfaEnabled(true);
        
        toast.current.show({ severity: 'success', summary: 'Activado', detail: 'MFA activado correctamente.', life: 5000 });
        handleCloseModal(); // Cerrar el modal
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al verificar MFA:', error);
      setVerificationError('Error al verificar el código. Intenta nuevamente.');
    }
  };


  const handleDisableMFA = async () => {
    if (!verificationCode) {
      setVerificationError('Es necesario ingresar el código para desactivar MFA.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/mfa/verify-mfa',
        {
          userId: userId,
          token: verificationCode,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      if (response.data.message === 'Código MFA verificado correctamente.') {
        await axios.post(
          'http://localhost:3001/api/mfa/disable-mfa',
          { userId: userId },
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        setIsMfaEnabled(false); // Deshabilitar MFA
       
        toast.current.show({ severity: 'info', summary: 'Desactivado', detail: 'MFA desactivado correctamente.', life: 5000 });
        handleCloseModal(); // Cerrar el modal
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al deshabilitar MFA:', error);
      setVerificationError('Error al deshabilitar MFA.');
    }
  };

  // Función para cerrar el modal sin cambiar el estado de MFA si no se verifica
  const handleCloseModal = () => {
    setOpenModal(false);
    setVerificationCode('');  
    setVerificationError(''); 
    setQrCodeUrl('');        
  };

  return (
    <div>
      <Toast ref={toast} />
      <Typography variant="h6">Autenticación Multifactor</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={isMfaEnabled}
            onChange={isMfaEnabled ? () => setOpenModal(true) : handleEnableMFA}
            color="primary"
          />
        }
        label={isMfaEnabled ? 'MFA activado' : 'MFA desactivado'}
      />

      {/* Modal para mostrar el código QR y verificar MFA */}
      <Modal
        open={openModal}
        onClose={handleCloseModal} 
        disableBackdropClick={true} 
      >
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: '500px', mx: 'auto', my: '10%', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Protege tu cuenta</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {isMfaEnabled
              ? 'Ingresa el código desde tu aplicación para desactivar MFA.'
              : 'Escanea el código QR con tu aplicación de autenticación y luego ingresa el código de verificación generado. El multifactor ya está activo, pero debes validar el código para completar la configuración.'}
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : qrCodeUrl && !isMfaEnabled ? (
            <img src={qrCodeUrl} alt="Código QR" style={{ width: '200px', height: '200px' }} />
          ) : null}

          <TextField
            fullWidth
            label="Ingresa el código único"
            variant="outlined"
            margin="normal"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!verificationError}
            helperText={verificationError}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={isMfaEnabled ? handleDisableMFA : handleVerifyMFA}
            disabled={loading || !verificationCode}  // Solo habilitar si hay código y no está cargando
          >
            {isMfaEnabled ? 'Desactivar MFA' : 'Verificar MFA'}
          </Button>
        </Box>
      </Modal>

      {isMfaEnabled && <Typography variant="body2" color="success.main">MFA activado exitosamente.</Typography>}
    </div>
  );
};

export default MFAComponent;
