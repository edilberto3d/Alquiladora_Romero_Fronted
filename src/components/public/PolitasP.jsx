

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, CircularProgress, Alert } from '@mui/material';

const TerminosList = () => {
  const [terminos, setTerminos] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/politicas';

  useEffect(() => {
    const fetchTerminos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vigente`, { withCredentials: true });
        const terminosData = response.data;

        // Verificar si terminosData existe
        if (!terminosData) {
          throw new Error('No se encontraron términos vigentes.');
        }

        // Verificar si secciones es una cadena JSON y parsearla
        let seccionesParsed = [];
        if (typeof terminosData.secciones === 'string') {
          try {
            seccionesParsed = JSON.parse(terminosData.secciones);
          } catch (parseError) {
            console.error('Error al parsear las secciones:', parseError);
            seccionesParsed = [];
          }
        } else if (Array.isArray(terminosData.secciones)) {
          seccionesParsed = terminosData.secciones;
        }

        // Crear una nueva fecha y añadir un día
        let fechaVigencia = terminosData.fechaVigencia ? new Date(terminosData.fechaVigencia) : null;
        if (fechaVigencia) {
          fechaVigencia.setDate(fechaVigencia.getDate() + 1);
        }

        const mappedTerminos = {
          ...terminosData,
          // Actualizar fechaVigencia con el nuevo valor
          fechaVigencia: fechaVigencia ? fechaVigencia.toISOString() : null,
          secciones: seccionesParsed,
        };

        setTerminos(mappedTerminos);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los términos:', error);
        setError('No se pudieron cargar los términos y condiciones. Inténtalo más tarde.');
        setLoading(false);
      }
    };

    fetchTerminos();
  }, [apiUrl]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  const hasSecciones = terminos && Array.isArray(terminos.secciones) && terminos.secciones.length > 0;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      {/* Título */}
      <Typography variant="h4" align="center" gutterBottom>
        {terminos ? terminos.titulo : 'Cargando...'}
      </Typography>

      {/* Contenido */}
      <Typography variant="body1" paragraph>
        {terminos ? terminos.contenido : 'Cargando contenido...'} 
      </Typography>

      {/* Fecha de Vigencia */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Fecha de vigencia: {terminos && terminos.fechaVigencia ? new Date(terminos.fechaVigencia).toLocaleDateString('es-MX', { 
          timeZone: 'America/Mexico_City',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        
        }) : 'Cargando fecha...'} 
      </Typography>

      {/* Secciones */}
      {hasSecciones ? (
        <List>
          {terminos.secciones.map((seccion, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Typography variant="h6" color="primary">
                {`Sección ${index + 1}: ${seccion.titulo}`}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {seccion.contenido}
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: '20px' }}>
          Actualmente no hay términos y condiciones vigentes. Por favor, verifica más tarde.
        </Typography>
      )}
    </Box>
  );
};

export default TerminosList;
