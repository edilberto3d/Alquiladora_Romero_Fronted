import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, useMediaQuery } from '@mui/material';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import axios from 'axios';

function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const checkServerStatus = async () => {
    const startTime = Date.now();
    try {
      const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/usuarios/ping", {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        const latency = Date.now() - startTime;
        setIsServerReachable(true);
        setIsSlowConnection(latency > 3000);
      } else {
        setIsServerReachable(false);
      }
    } catch (error) {
      setIsServerReachable(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkServerStatus, 10000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [csrfToken]);

  const alertStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    textAlign: 'center',
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 1300,
    p: 2,
  };

  // Sin conexión a Internet
  if (!isOnline) {
    return (
      <Box sx={{ ...alertStyles, backgroundColor: 'error.main', color: 'common.white' }}>
        <SignalWifiOffIcon sx={{ fontSize: isMobile ? 30 : 40, mr: 1 }} />
        <Typography variant={isMobile ? "body2" : "h6"}>Sin conexión</Typography>
      </Box>
    );
  }

  // Conexión lenta
  if (isSlowConnection) {
    return (
      <Alert severity="warning" sx={{ ...alertStyles, backgroundColor: 'warning.main', color: 'black' }}>
        <NetworkCheckIcon sx={{ fontSize: isMobile ? 30 : 40, mr: 1 }} />
        <Typography variant={isMobile ? "body2" : "h6"}>Conexión inestable</Typography>
      </Alert>
    );
  }

  // Servidor inalcanzable
  if (isOnline && !isServerReachable) {
    return (
      <Alert severity="error" sx={{ ...alertStyles, backgroundColor: 'error.main', color: 'common.white' }}>
        <SignalWifiStatusbarConnectedNoInternet4Icon sx={{ fontSize: isMobile ? 30 : 40, mr: 1 }} />
        <Typography variant={isMobile ? "body2" : "h6"}>Servidor inalcanzable</Typography>
      </Alert>
    );
  }

  return null;
}

export default ConnectionStatus;
