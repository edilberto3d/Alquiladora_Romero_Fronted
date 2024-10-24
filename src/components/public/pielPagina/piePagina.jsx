import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { Box, Typography, Grid } from '@mui/material';
import '../../../css/footer.css'; // Asegúrate de que este archivo exista
import { ThemeContext } from '../../shared/layaouts/ThemeContext'; 

const PiePagina = () => {
  const { theme } = useContext(ThemeContext); // Acceder al tema actual

  return (
    <Box
      className="footer-container"
      sx={{
        backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
        color: theme === 'light' ? '#000' : '#fff',
        padding: '20px',
        marginTop: 'auto', // Asegura que el footer se quede abajo
      }}
    >
      <Grid container spacing={3}>
        {/* Información de la empresa */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>
            INFORMACIÓN DE LA EMPRESA
          </Typography>
          <Link
            to="/vision-mision"
            style={{
              textDecoration: 'none',
              color: theme === 'light' ? '#007bff' : '#4fc3f7', // Color del link según el tema
            }}
          >
            Visión y Misión
          </Link>
        </Grid>

        {/* Contacto */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>
            CONTACTO
          </Typography>
          <Typography>Teléfono: (123) 456-7890</Typography>
          <Typography>Dirección: Ciudad XYZ</Typography>
        </Grid>

        {/* Redes sociales */}
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff' }}>
            SÍGUENOS EN NUESTRAS REDES
          </Typography>
          <Box>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon
                icon={faFacebook}
                size="2x"
                style={{ marginRight: '10px', color: theme === 'light' ? '#3b5998' : '#8b9dc3' }} // Color del ícono según el tema
              />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon
                icon={faInstagram}
                size="2x"
                style={{ marginRight: '10px', color: theme === 'light' ? '#C13584' : '#e1306c' }} // Color del ícono según el tema
              />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon
                icon={faTwitter}
                size="2x"
                style={{ color: theme === 'light' ? '#1DA1F2' : '#00aced' }} // Color del ícono según el tema
              />
            </a>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="body2" sx={{ color: theme === 'light' ? '#000' : '#fff' }}>
          © 2024 Copyright
        </Typography>
      </Box>
    </Box>
  );
};

export default PiePagina;
