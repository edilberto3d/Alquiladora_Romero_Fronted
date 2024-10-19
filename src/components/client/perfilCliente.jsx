import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Importa el icono de carga
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Tabs,
  Tab,
  AppBar,
  Backdrop,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Toast } from 'primereact/toast';
import { useAuth } from '../shared/layaouts/AuthContext';

const UserProfile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { user, updateUser } = useAuth();
  const [usuario, setUsuario] = useState(user || {});
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(usuario.fecha_actualizacionF ? new Date(usuario.fecha_actualizacionF) : null);
  
  // Manejo de cambio de tabs
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleImageChange = async (file) => {
    const now = new Date();
    if (lastUpdated && differenceInMonths(now, lastUpdated) < 2) {
      toast.current.show({
        severity: 'warn',
        summary: 'Cambio de Foto de Perfil',
        detail: 'Solo puedes cambiar tu foto de perfil cada dos meses.',
        life: 5000,
      });
      return;
    }

    const formData = new FormData();
    formData.append('imagen', file);
    setUploading(true);

    try {
      const response = await axios.post('https://plaza-del-sabor-server.onrender.com/api/imagenes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = response.data.url;

      await axios.patch(`https://plaza-del-sabor-server.onrender.com/api/usuarios/perfil/${usuario._id}`, {
        foto_perfil: imageUrl,
        fecha_actualizacionF: now.toISOString(),
      });

      setUsuario((prevUsuario) => ({
        ...prevUsuario,
        foto_perfil: imageUrl,
        fecha_actualizacionF: now.toISOString(),
      }));

      toast.current.show({
        severity: 'success',
        summary: 'Cambio de Foto de Perfil',
        detail: 'Foto de perfil actualizado correctamente.',
        life: 5000,
      });
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      toast.current.show({
        severity: 'error',
        summary: 'Error en la Actualización',
        detail: 'Error al actualizar la foto de perfil.',
        life: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const data = {
    nombre: usuario.nombre || 'no definido',
    apellidoP: usuario.apellidoP || 'no definido',
    apellidoM: usuario.apellidoM || 'no definido',
    username: usuario.username || 'no definido',
    correo: usuario.correo || 'no definido',
    telefono: usuario.telefono || 'no definido',
    fecha_nacimiento: usuario.fecha_nacimiento || 'no definido',
    genero: usuario.genero || 'no definido',
    preferencias_comida: usuario.preferencias_comida || 'no definido',
    ubicacion: {
      calle: usuario.ubicacion?.calle ?? 'no definido',
      localidad: usuario.ubicacion?.localidad ?? 'no definido',
      municipio: usuario.ubicacion?.municipio ?? 'no definido',
      estado: usuario.ubicacion?.estado ?? 'no definido',
      pais: usuario.ubicacion?.pais ?? 'México',
      codigo_postal: usuario.ubicacion?.codigo_postal ?? 'no definido',
      detalles: usuario.ubicacion?.detalles ?? 'no definido',
    },
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs"
          >
            <Tab label="Información Personal" icon={<PersonIcon />} />
            <Tab label="Ubicación" icon={<LocationOnIcon />} />
            <Tab label="Preferencias" icon={<PeopleIcon />} />
            <Tab label="Seguridad" icon={<SecurityIcon />} />
          </Tabs>
        </AppBar>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {tabIndex === 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar
                      src={usuario.foto_perfil || "default_profile_picture.jpg"}
                      alt="Profile"
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">{data.username}</Typography>
                      <Typography variant="body1">{data.correo}</Typography>
                    </Box>
                    <FontAwesomeIcon
                      icon={faCamera}
                      style={{ marginLeft: 'auto', cursor: 'pointer' }}
                      onClick={() => fileInputRef.current.click()}
                    />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      accept=".jpg,.png,.jpeg,.webp"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Información Personal
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Nombre" secondary={data.nombre} />
                      <FontAwesomeIcon icon={faEdit} onClick={() => {}} style={{ cursor: 'pointer' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Apellido Paterno" secondary={data.apellidoP} />
                      <FontAwesomeIcon icon={faEdit} onClick={() => {}} style={{ cursor: 'pointer' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Correo Electrónico" secondary={data.correo} />
                    </ListItem>
                  </List>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Backdrop open={uploading} style={{ zIndex: 1200 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <AiOutlineLoading3Quarters className="loading-icon" style={{ fontSize: 50 }} />
            <Typography variant="h6" color="inherit" sx={{ mt: 2 }}>
              Subiendo imagen...
            </Typography>
          </Box>
        </Backdrop>

        <Toast ref={toast} />
      </Container>
    </>
  );
};

export default UserProfile;
