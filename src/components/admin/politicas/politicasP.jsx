import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as yup from 'yup';
import {
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';

const MySwal = withReactContent(Swal);

// Validaciones con Yup
const validationSchema = yup.object().shape({
  titulo: yup.string().required('El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  contenido: yup.string().required('El contenido es obligatorio'),
  fechaVigencia: yup
    .date()
    .required('La fecha de vigencia es obligatoria')
    .min(new Date(), 'La fecha de vigencia no puede ser pasada'),
  secciones: yup
    .array()
    .of(
      yup.object().shape({
        titulo: yup.string().required('El título de la sección es obligatorio'),
        contenido: yup.string().required('El contenido de la sección es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos una sección'),
});

const Politicas = () => {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const { theme } = useContext(ThemeContext);

  const apiUrl = 'http://localhost:3001/api/politicas';

  useEffect(() => {
    fetchCsrfToken();
    fetchPoliticas();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/get-csrf-token', {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Error al obtener el token CSRF', error);
    }
  };

  const extractValue = (versioField) => {
    if (typeof versioField === 'object' && versioField !== null) {
      // Ajusta según la estructura de tu objeto
      return versioField.data || versioField.value || ''; // Modifica esto según corresponda
    }
    return versioField;
  };

  const fetchPoliticas = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });

      // Procesamos los datos recibidos
      const parsedData = response.data.map((politica) => ({
        ...politica,
        versio: extractValue(politica.versio),
        secciones:
          typeof politica.secciones === 'string'
            ? JSON.parse(politica.secciones)
            : politica.secciones || [],
      }));

      setPoliticas(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener políticas:', error);
      setError('No se pudieron cargar las políticas');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      titulo: '',
      contenido: '',
      fechaVigencia: '',
      secciones: [{ titulo: '', contenido: '' }],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await createNewVersion(currentVersion.id, values);
      } else {
        await createPolitica(values);
      }
      resetForm();
      setEditMode(false);
      setCurrentVersion(null);
      fetchPoliticas();
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, handleReset, setFieldValue } = formik;

  const createPolitica = async (data) => {
    try {
      await axios.post(apiUrl, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      MySwal.fire('Éxito', 'Se creó la política correctamente', 'success');
    } catch (error) {
      console.log('Error al crear la política:', error);
      MySwal.fire('Error', 'No se pudo crear la política', 'error');
    }
  };

  const createNewVersion = async (id, data) => {
    try {
      await axios.post(`${apiUrl}/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      MySwal.fire('Éxito', 'Se creó una nueva versión de la política', 'success');
    } catch (error) {
      console.error('Error al crear nueva versión:', error);
      MySwal.fire('Error', 'No se pudo crear la nueva versión', 'error');
    }
  };

  const deletePolitica = async (id) => {
    const confirm = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará la política como eliminada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });
        MySwal.fire('Eliminado', 'Política eliminada correctamente', 'success');
        fetchPoliticas();
      } catch (error) {
        console.error('Error al eliminar política:', error);
        MySwal.fire('Error', 'No se pudo eliminar la política', 'error');
      }
    }
  };

  const editPolitica = (politica) => {
    setCurrentVersion(politica);
    setFieldValue('titulo', politica.titulo);
    setFieldValue('contenido', politica.contenido);
    setFieldValue('fechaVigencia', politica.fechaVigencia ? politica.fechaVigencia.substring(0, 10) : '');
    setFieldValue('secciones', politica.secciones || [{ titulo: '', contenido: '' }]);
    setEditMode(true);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container
      maxWidth="md"
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
        Gestión de Políticas de Privacidad
      </Typography>

      <FormikProvider value={formik}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            name="titulo"
            value={values.titulo}
            onChange={handleChange}
            error={touched.titulo && Boolean(errors.titulo)}
            helperText={touched.titulo && errors.titulo}
            margin="normal"
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />
          <TextField
            fullWidth
            label="Contenido"
            name="contenido"
            value={values.contenido}
            onChange={handleChange}
            error={touched.contenido && Boolean(errors.contenido)}
            helperText={touched.contenido && errors.contenido}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />
          <TextField
            fullWidth
            label="Fecha de Vigencia"
            name="fechaVigencia"
            type="date"
            value={values.fechaVigencia}
            onChange={handleChange}
            error={touched.fechaVigencia && Boolean(errors.fechaVigencia)}
            helperText={touched.fechaVigencia && errors.fechaVigencia}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />
          <FieldArray name="secciones">
            {({ push, remove }) => (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 2, color: theme === 'dark' ? '#ccc' : '#666' }}
                >
                  Secciones
                </Typography>
                {Array.isArray(values.secciones) &&
                  values.secciones.map((section, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: theme === 'dark' ? '#333' : '#fff',
                        boxShadow: 1,
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={11}>
                          <TextField
                            fullWidth
                            label={`Título de la Sección ${index + 1}`}
                            name={`secciones[${index}].titulo`}
                            value={section.titulo}
                            onChange={handleChange}
                            error={
                              touched.secciones?.[index]?.titulo &&
                              Boolean(errors.secciones?.[index]?.titulo)
                            }
                            helperText={
                              touched.secciones?.[index]?.titulo &&
                              errors.secciones?.[index]?.titulo
                            }
                            margin="normal"
                            variant="outlined"
                            sx={{
                              bgcolor: theme === 'dark' ? '#2e2e2e' : '#fafafa',
                            }}
                          />
                          <TextField
                            fullWidth
                            label={`Contenido de la Sección ${index + 1}`}
                            name={`secciones[${index}].contenido`}
                            value={section.contenido}
                            onChange={handleChange}
                            error={
                              touched.secciones?.[index]?.contenido &&
                              Boolean(errors.secciones?.[index]?.contenido)
                            }
                            helperText={
                              touched.secciones?.[index]?.contenido &&
                              errors.secciones?.[index]?.contenido
                            }
                            margin="normal"
                            multiline
                            rows={3}
                            variant="outlined"
                            sx={{
                              bgcolor: theme === 'dark' ? '#2e2e2e' : '#fafafa',
                            }}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton color="error" onClick={() => remove(index)}>
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => push({ titulo: '', contenido: '' })}
                  sx={{ mt: 2 }}
                >
                  Agregar Sección
                </Button>
              </Box>
            )}
          </FieldArray>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editMode && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => {
                  handleReset();
                  setEditMode(false);
                  setCurrentVersion(null);
                }}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                bgcolor: theme === 'dark' ? '#1976d2' : '#1976d2',
                '&:hover': {
                  bgcolor: theme === 'dark' ? '#1565c0' : '#1565c0',
                },
              }}
            >
              {editMode ? 'Crear Nueva Versión' : 'Agregar Política'}
            </Button>
          </Box>
        </form>
      </FormikProvider>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Lista de Políticas de Privacidad
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
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Título</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Versión</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>
                Fecha de Vigencia
              </TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {politicas.map((politica) => (
              <TableRow key={politica.id}>
                <TableCell>{politica.titulo}</TableCell>
                <TableCell>{politica.versio}</TableCell>
                <TableCell>
                  {new Date(politica.fechaVigencia).toLocaleDateString()}
                </TableCell>
                <TableCell>{politica.estado}</TableCell>
                <TableCell>
  {politica.estado !== 'eliminado' && (
    <>
      <IconButton onClick={() => editPolitica(politica)} color="warning">
        <Edit />
      </IconButton>
      {politica.estado !== 'eliminado' && (
        <IconButton onClick={() => deletePolitica(politica.id)} color="error">
          <Delete />
        </IconButton>
      )}
    </>
  )}
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default Politicas;
