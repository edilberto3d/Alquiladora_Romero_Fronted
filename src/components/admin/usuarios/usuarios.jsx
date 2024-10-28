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
} from '@mui/material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/usuarios/lista', {
        withCredentials: true,
      });
      setUsuarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(true);
      setLoading(false);
    }
  };

  // Separar usuarios por rol
  const administradores = usuarios.filter((usuario) => usuario.Rol === 'Administrador');
  const clientes = usuarios.filter((usuario) => usuario.Rol === 'Cliente');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">No se pudo obtener la lista de usuarios.</Alert>
    );
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
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Administradores
      </Typography>
      <Paper
        sx={{
          bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
          boxShadow: 1,
          overflowX: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === 'dark' ? '#333' : '#0277bd' }}>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Veces Bloqueado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Contraseña</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Correo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {administradores.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
                <TableCell>{`${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`}</TableCell>
                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>{usuario.cambios_correo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Tabla de Clientes */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Clientes
      </Typography>
      <Paper
        sx={{
          bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
          boxShadow: 1,
          overflowX: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === 'dark' ? '#333' : '#0277bd' }}>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Veces Bloqueado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Contraseña</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Cambios de Correo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
                <TableCell>{`${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`}</TableCell>
                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>{usuario.cambios_correo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default Usuarios;
