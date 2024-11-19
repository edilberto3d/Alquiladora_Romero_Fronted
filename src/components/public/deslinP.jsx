// src/components/DeslinList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, CircularProgress, Alert } from '@mui/material';

const DeslinList = () => {
  const [deslin, setDeslin] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/deslin';

  useEffect(() => {
    const fetchDeslin = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vigente`, { withCredentials: true });
        const deslinData = response.data;

        // Verificar si secciones es una cadena JSON y parsearla
        let seccionesParsed = [];
        if (typeof deslinData.secciones === 'string') {
          try {
            seccionesParsed = JSON.parse(deslinData.secciones);
          } catch (parseError) {
            console.error('Error al parsear las secciones:', parseError);
            seccionesParsed = [];
          }
        } else if (Array.isArray(deslinData.secciones)) {
          seccionesParsed = deslinData.secciones;
        }

        // Crear una nueva fecha y añadir un día
        let fechaVigencia = deslinData.fecha_vigencia ? new Date(deslinData.fecha_vigencia) : null;
        if (fechaVigencia) {
          fechaVigencia.setDate(fechaVigencia.getDate() + 1);
        }

        const mappedDeslin = {
          ...deslinData,
          // Renombrar fecha_vigencia a fechaVigencia para consistencia
          fechaVigencia: fechaVigencia ? fechaVigencia.toISOString() : null,
          secciones: seccionesParsed,
        };

        setDeslin(mappedDeslin);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los deslindes:', error);
        setError('No se pudieron cargar los deslindes. Inténtalo más tarde.');
        setLoading(false);
      }
    };

    fetchDeslin();
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

  const hasSecciones = deslin && Array.isArray(deslin.secciones) && deslin.secciones.length > 0;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      {/* Título */}
      <Typography variant="h4" align="center" gutterBottom>
        {deslin ? deslin.titulo : 'Cargando...'}
      </Typography>

      {/* Contenido */}
      <Typography variant="body1" paragraph>
        {deslin ? deslin.contenido : 'Cargando contenido...'} 
      </Typography>

      {/* Fecha de Vigencia */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Fecha de vigencia: {deslin && deslin.fechaVigencia ? new Date(deslin.fechaVigencia).toLocaleDateString('es-MX', { 
          timeZone: 'America/Mexico_City',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) : 'Cargando fecha...'} 
      </Typography>

      {/* Secciones */}
      {hasSecciones ? (
        <List>
          {deslin.secciones.map((seccion, index) => (
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
          Actualmente no hay deslindes vigentes. Por favor, verifica más tarde.
        </Typography>
      )}
    </Box>
  );
};

export default DeslinList;
