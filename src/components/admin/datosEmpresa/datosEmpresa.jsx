import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Modal,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, CameraAlt as CameraAltIcon, Add as AddIcon } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Toast } from 'primereact/toast';

// Expresiones regulares para validación
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const urlRegex = /^(https?:\/\/)/;

const CrudEmpresa = () => {
  const [empresaData, setEmpresaData] = useState({
    logo: '',
    direccion: '',
    correo: '',
    telefono: '',
    redes_sociales: {}, // Redes sociales como objeto dinámico
  });

  const [openModal, setOpenModal] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(faGlobe);
  const [currentSocialKey, setCurrentSocialKey] = useState(''); // Para identificar la red social
  const toast = useRef(null);

  // Opciones de íconos para las redes sociales
  const iconOptions = [
    { name: 'Facebook', icon: faFacebook },
    { name: 'Instagram', icon: faInstagram },
    { name: 'Twitter', icon: faTwitter },
    { name: 'Other', icon: faGlobe }
  ];

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
    fetchCsrfToken();
  }, []);

  const fetchEmpresaData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/empresa", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      setEmpresaData({
        logo: response.data.logo_url || '',
        direccion: response.data.direccion || '',
        correo: response.data.correo || '',
        telefono: response.data.telefono || '',
        redes_sociales: JSON.parse(response.data.redes_sociales || '{}'),
      });
    } catch (error) {
      console.error("Error al obtener datos de la empresa", error);
    }
  };

  useEffect(() => {
    fetchEmpresaData();
  }, [csrfToken]);

  // Abrir modal para editar un campo
  const handleOpenModal = (field, socialKey = '') => {
    setCurrentField(field);
    setNewValue(socialKey ? empresaData.redes_sociales[socialKey] : empresaData[field]);
    setCurrentSocialKey(socialKey);
    setSelectedIcon(getSocialIcon(socialKey ? empresaData.redes_sociales[socialKey] : empresaData[field]));
    setErrorMessage('');
    setOpenModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Validación de campos
  const validateField = () => {
    if (['correo'].includes(currentField) && !emailRegex.test(newValue)) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return false;
    } else if (['telefono'].includes(currentField) && !phoneRegex.test(newValue)) {
      setErrorMessage('El teléfono debe contener exactamente 10 dígitos numéricos.');
      return false;
    } else if (['facebook', 'instagram', 'twitter', 'redes_sociales'].includes(currentField) && !urlRegex.test(newValue)) {
      setErrorMessage('Por favor, ingresa una URL válida que comience con http o https.');
      return false;
    } else if (['direccion'].includes(currentField) && (newValue.trim().length < 5 || newValue.trim().length > 40)) {
      setErrorMessage('La dirección debe tener entre 5 y 40 caracteres.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Guardar los cambios
  const handleSave = async () => {
    if (!validateField()) return;

    const updatedData = { ...empresaData };
    
    if (currentField === 'redes_sociales') {
      updatedData.redes_sociales[currentSocialKey] = newValue;
    } else {
      updatedData[currentField] = newValue;
    }

    try {
      await axios.post(`http://localhost:3001/api/empresa/actualizar`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      setEmpresaData(updatedData);
      handleCloseModal();
      toast.current.show({ severity: 'success', summary: 'Actualización exitosa', detail: `El campo ${currentField} se actualizó correctamente`, life: 3000 });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: `El campo ${currentField} no se actualizó`, life: 3000 });
      console.error(`Error al actualizar el campo ${currentField}`, error);
    }
  };

  // Añadir una nueva red social
  const addNewSocial = () => {
    const newSocialKey = `new_social_${Object.keys(empresaData.redes_sociales).length + 1}`;
    const updatedRedesSociales = {
      ...empresaData.redes_sociales,
      [newSocialKey]: '',
    };
    setEmpresaData(prevData => ({ ...prevData, redes_sociales: updatedRedesSociales }));
    handleOpenModal('redes_sociales', newSocialKey);
  };

  // Obtener el ícono de la red social basado en la URL
  const getSocialIcon = (url) => {
    if (url.includes('facebook.com')) return faFacebook;
    if (url.includes('instagram.com')) return faInstagram;
    if (url.includes('twitter.com')) return faTwitter;
    return faGlobe;
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: '900px', margin: 'auto' }}>
      <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={4}>
        <Avatar
          alt="Logo de la empresa"
          src={empresaData.logo}
          sx={{ width: { xs: 100, md: 150 }, height: { xs: 100, md: 150 }, boxShadow: 3 }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 'calc(50% - 50px)',
            backgroundColor: 'white',
            borderRadius: '50%',
          }}
          onClick={() => handleOpenModal('logo')}
        >
          <CameraAltIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
        {['correo', 'direccion', 'telefono'].map((field, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box
              sx={{
                border: '1px solid #ddd',
                padding: 2,
                borderRadius: 2,
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold">{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
              <Typography>{empresaData[field]}</Typography>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handleOpenModal(field)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box
            sx={{
              border: '1px solid #ddd',
              padding: 2,
              borderRadius: 2,
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold">Redes Sociales</Typography>
            <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.keys(empresaData.redes_sociales).map((socialKey, index) => (
                <Box component="li" key={index} display="flex" alignItems="center" mb={1}>
                  <FontAwesomeIcon icon={getSocialIcon(empresaData.redes_sociales[socialKey])} style={{ marginRight: 10 }} />
                  <Typography>{empresaData.redes_sociales[socialKey]}</Typography>
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => handleOpenModal('redes_sociales', socialKey)}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNewSocial}
              sx={{ mt: 2 }}
            >
              Añadir Red Social
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Editar {currentField.charAt(0).toUpperCase() + currentField.slice(1)}
          </Typography>
          <TextField
            fullWidth
            label={`Nuevo ${currentField}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            margin="normal"
            error={!!errorMessage}
            helperText={errorMessage}
          />
          {currentField === 'redes_sociales' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecciona un icono</InputLabel>
              <Select
                value={selectedIcon.icon}
                onChange={(e) => setSelectedIcon(iconOptions.find(option => option.icon === e.target.value))}
              >
                {iconOptions.map(option => (
                  <MenuItem key={option.name} value={option.icon}>
                    <FontAwesomeIcon icon={option.icon} style={{ marginRight: 10 }} />
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
            Guardar
          </Button>
        </Box>
      </Modal>
      <Toast ref={toast} /> {/* Componente Toast */}
    </Box>
  );
};

export default CrudEmpresa;
