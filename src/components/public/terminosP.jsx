import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const TerminosList = () => {
  const [terminos, setTerminos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = 'http://localhost:3001/api/terminos';

  useEffect(() => {
    const fetchTerminos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/vigente`, { withCredentials: true });
        const terminosData = response.data;

        // Verificamos si `terminosData.secciones` es un string y lo parseamos a JSON
        if (terminosData && typeof terminosData.secciones === 'string') {
          terminosData.secciones = JSON.parse(terminosData.secciones);
        }

        setTerminos(terminosData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los términos:', error);
        setError('No se pudieron cargar los términos y condiciones.');
        setLoading(false);
      }
    };

    fetchTerminos();
  }, [apiUrl]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        {terminos.titulo}
      </Typography>
      <Typography variant="body1" paragraph>
        {terminos.contenido}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Fecha de vigencia: {new Date(terminos.fechaVigencia).toLocaleDateString()}
      </Typography>

      <List>
        {Array.isArray(terminos.secciones) && terminos.secciones.length > 0 && (
          terminos.secciones.map((seccion, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Typography variant="h6" color="primary">{seccion.titulo}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {seccion.contenido}
              </Typography>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default TerminosList;
