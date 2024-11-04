import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';
import InfoIcon from '@mui/icons-material/Info';

const Usuarios = () => {
  // Estados para almacenar usuarios, estados de carga y errores
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados para el manejo del modal de detalles de sesiones
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserSessions, setSelectedUserSessions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState('');

  const { theme } = useContext(ThemeContext);

  // Obtener lista de usuarios al cargar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para obtener los usuarios desde la API
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/usuarios/lista', {
        withCredentials: true,
      });
      setUsuarios(response.data);  // Almacena los usuarios en el estado
      setLoading(false);           // Cambia el estado de carga a false
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(true);               // Cambia el estado de error a true en caso de fallo
      setLoading(false);
    }
  };

  // Función para abrir el modal de detalles de sesiones y cargar las sesiones del usuario seleccionado
  const handleOpenDialog = async (usuario) => {
    // Configura el nombre completo del usuario seleccionado
    setSelectedUserName(`${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`);
    
    // Intenta obtener las sesiones del usuario desde la API
    try {
      const response = await axios.get(
        `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/${usuario.idUsuarios}/sesiones`,
        {
          withCredentials: true,
        }
      );
      setSelectedUserSessions(response.data);  // Almacena las sesiones en el estado
    } catch (error) {
      console.error('Error al obtener detalles de sesiones:', error);
      setSelectedUserSessions([]);             // Si hay un error, se asegura de que esté vacío
    }

    // Abre el modal después de configurar el nombre y las sesiones
    setOpenDialog(true);
  };

  // Función para cerrar el modal y limpiar los estados de sesión y nombre de usuario
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserSessions([]);  // Limpia las sesiones seleccionadas
    setSelectedUserName('');      // Limpia el nombre de usuario seleccionado
  };

  // Filtra usuarios por su rol
  const administradores = usuarios.filter((usuario) => usuario.Rol === 'Administrador');
  const clientes = usuarios.filter((usuario) => usuario.Rol === 'Cliente');

  // Muestra un indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Muestra un mensaje de error si no se pudieron obtener los datos
  if (error) {
    return <Alert severity="error">No se pudo obtener la lista de usuarios.</Alert>;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        bgcolor: theme === 'dark' ? '#121212' : '#f9f9f9',
        p: 3,
        borderRadius: '8px',
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Gestión de Usuarios
      </Typography>

      {/* Tabla de Administradores */}
      <Typography variant="h5" gutterBottom sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}>
        Administradores
      </Typography>
      <Paper sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff', boxShadow: 1, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === 'dark' ? '#333' : '#0277bd' }}>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Veces Bloqueado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Contraseña</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Inicios de Sesión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {administradores.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
                <TableCell>{`${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`}</TableCell>
                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>
                  {usuario.veces_sesion}
                  <Tooltip title="Más detalles de inicio de sesión">
                    <IconButton onClick={() => handleOpenDialog(usuario)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Tabla de Clientes */}
      <Typography variant="h5" gutterBottom sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}>
        Clientes
      </Typography>
      <Paper sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff', boxShadow: 1, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === 'dark' ? '#333' : '#0277bd' }}>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Veces Bloqueado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Contraseña</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Inicios de Sesión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
                <TableCell>{`${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`}</TableCell>
                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>
                  {usuario.veces_sesion}
                  <Tooltip title="Más detalles de inicio de sesión">
                    <IconButton onClick={() => handleOpenDialog(usuario)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Diálogo de Detalles de Sesiones */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de Sesiones de {selectedUserName}</DialogTitle>
        <DialogContent>
          {selectedUserSessions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Inicio de Sesión</TableCell>
                  <TableCell>Fin de Sesión</TableCell>
                  <TableCell>Dirección IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedUserSessions.map((sesion) => (
                  <TableRow key={sesion.id}>
                    <TableCell>{sesion.horaInicio ? new Date(sesion.horaInicio).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      {sesion.horaFin ? new Date(sesion.horaFin).toLocaleString() : 'Sesión Activa'}
                    </TableCell>
                    <TableCell>{sesion.direccionIP || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No hay sesiones disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Usuarios;
