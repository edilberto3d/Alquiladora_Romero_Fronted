import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Box, Typography, Grid } from '@mui/material';
import '../../../css/footer.css'; // Asegúrate de que este archivo exista

const PiePagina = () => {
  return (
    <Box sx={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
      <Grid container spacing={3}>

        {/* Información de la empresa */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>INFORMACIÓN DE LA EMPRESA</Typography>
          <Link to="/vision-mision" style={{ textDecoration: 'none', color: '#007bff' }}>Visión y Misión</Link>
        </Grid>

        {/* Contacto */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>CONTACTO</Typography>
          <Typography>Teléfono: (123) 456-7890</Typography>
          <Typography>Dirección: Ciudad XYZ</Typography>
        </Grid>

        {/* Redes sociales */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>SÍGUENOS EN NUESTRAS REDES</Typography>
          <Box>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebook} size="2x" style={{ marginRight: '10px', color: '#3b5998' }} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} size="2x" style={{ marginRight: '10px', color: '#C13584' }} />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} size="2x" style={{ color: '#1DA1F2' }} />
            </a>
          </Box>
        </Grid>

      </Grid>
      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="body2">© 2024 Copyright</Typography>
      </Box>
    </Box>
  );
};

export default PiePagina;
