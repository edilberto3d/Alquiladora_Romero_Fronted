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

      
        const mappedDeslin = {
          ...deslinData,
          fechaVigencia: deslinData.fecha_vigencia,
          secciones: typeof deslinData.secciones === 'string' ? JSON.parse(deslinData.secciones) : deslinData.secciones,
        };

        setDeslin(mappedDeslin);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los deslines:', error);
        setError('No se pudieron cargar los deslindes. Inténtalo más tarde');
        setLoading(false);
      }
    };

    fetchDeslin();
  }, [apiUrl]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

 
  const hasSecciones = deslin && Array.isArray(deslin.secciones) && deslin.secciones.length > 0;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        {deslin ? deslin.titulo : 'Cargando...'}
      </Typography>
      <Typography variant="body1" paragraph>
        {deslin ? deslin.contenido : 'Cargando contenido...'} 
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Fecha de vigencia: {deslin ? new Date(deslin.fechaVigencia).toLocaleDateString() : 'Cargando fecha...'} 
      </Typography>

      {hasSecciones ? (
        <List>
          {deslin.secciones.map((seccion, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Typography variant="h6" color="primary">{seccion.titulo}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {seccion.contenido}
              </Typography>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: '20px' }}>
          {deslin && deslin.error ? deslin.error : 'Actualmente no hay deslindes vigentes. Por favor, verifica más tarde.'}
        </Typography>
      )}
    </Box>
  );
};

export default DeslinList;
