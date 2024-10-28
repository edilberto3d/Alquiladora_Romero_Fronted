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
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';

const MySwal = withReactContent(Swal);

//====================================VALIDACIONES==============================================
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
//===============================================================================

const Terminos = () => {
  const [terminos, setTerminos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const { theme } = useContext(ThemeContext);

  const apiUrl = 'http://localhost:3001/api/terminos';

  useEffect(() => {
    fetchCsrfToken();
    fetchTerminos();
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

  //===============================================================================
  const fetchTerminos = async () => {
    try {
      const response = await axios.get(apiUrl, {
        withCredentials: true,
      });
      // Procesamos los términos para asegurar que las secciones están en formato de array
      const terminosData = response.data.map((termino) => ({
        ...termino,
        secciones:
          typeof termino.secciones === 'string'
            ? JSON.parse(termino.secciones)
            : termino.secciones || [],
        fechaVigencia: termino.fechaVigencia || termino.fecha_vigencia,
        versio: termino.versio ? termino.versio.toString() : '',
      }));
      setTerminos(terminosData);
    } catch (error) {
      console.error('Error al obtener términos:', error);
      MySwal.fire('Error', 'No se pudo obtener la lista de términos', 'error');
    }
  };

  //vALIDACIONES
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
        await createTermino(values);
      }
      resetForm();
      setEditMode(false);
      setCurrentVersion(null);
      fetchTerminos();
    },
  });
  const { values, errors, touched, handleChange, handleSubmit, handleReset, setFieldValue } = formik;
  //=======================================================================
  //Creamos un nuevo termino version 1.0
  const createTermino = async (data) => {
    try {
      await axios.post(apiUrl, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      MySwal.fire('Éxito', 'Se creó el término correctamente', 'success');
    } catch (error) {
      console.log('Error al crear el termino:', error);
      MySwal.fire('Error', 'No se pudo crear el término', 'error');
    }
  };

  //=========================================================================
  //Creamos una nueva versión de  termino existente osea actualizar pero como nueva version
  const createNewVersion = async (id, data) => {
    try {
      await axios.post(`${apiUrl}/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      MySwal.fire('Éxito', 'Se creó una nueva versión del término', 'success');
    } catch (error) {
      console.error('Error al crear nueva versión:', error);
      MySwal.fire('Error', 'No se pudo crear la nueva versión', 'error');
    }
  };

  //Marcamos Termino como eliminado solo lógicamente
  const deleteTermino = async (id) => {
    const confirm = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará el término como eliminado.',
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
        MySwal.fire('Eliminado', 'Término eliminado correctamente', 'success');
        fetchTerminos();
      } catch (error) {
        console.error('Error al eliminar término:', error);
        MySwal.fire('Error', 'No se pudo eliminar el término', 'error');
      }
    }
  };

  //====Función para Editar término
  const editTermino = (termino) => {
    setCurrentVersion(termino);
    setFieldValue('titulo', termino.titulo);
    setFieldValue('contenido', termino.contenido);
    setFieldValue('fechaVigencia', termino.fechaVigencia.substring(0, 10));
    setFieldValue('secciones', termino.secciones);
    setEditMode(true);
  };

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, bgcolor: theme === 'dark' ? '#121212' : '#f9f9f9', p: 3, borderRadius: '8px' }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Gestión de Términos y Condiciones
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
            sx={{
              input: { color: theme === 'dark' ? '#fff' : '#000' },
              label: { color: theme === 'dark' ? '#bbb' : '#000' },
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
            sx={{
              input: { color: theme === 'dark' ? '#fff' : '#000' },
              label: { color: theme === 'dark' ? '#bbb' : '#000' },
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
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
            sx={{
              input: { color: theme === 'dark' ? '#fff' : '#000' },
              label: { color: theme === 'dark' ? '#bbb' : '#000' },
            }}
          />

          <FieldArray name="secciones">
            {({ push, remove }) => (
              <div>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 2, color: theme === 'dark' ? '#ccc' : '#666' }}
                >
                  Secciones
                </Typography>
                {values.secciones.map((section, index) => (
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
                            touched.secciones &&
                            touched.secciones[index] &&
                            touched.secciones[index].titulo &&
                            Boolean(errors.secciones?.[index]?.titulo)
                          }
                          helperText={
                            touched.secciones &&
                            touched.secciones[index] &&
                            touched.secciones[index].titulo &&
                            errors.secciones?.[index]?.titulo
                          }
                          margin="normal"
                          sx={{
                            input: { color: theme === 'dark' ? '#fff' : '#000' },
                            label: { color: theme === 'dark' ? '#bbb' : '#000' },
                          }}
                        />
                        <TextField
                          fullWidth
                          label={`Contenido de la Sección ${index + 1}`}
                          name={`secciones[${index}].contenido`}
                          value={section.contenido}
                          onChange={handleChange}
                          error={
                            touched.secciones &&
                            touched.secciones[index] &&
                            touched.secciones[index].contenido &&
                            Boolean(errors.secciones?.[index]?.contenido)
                          }
                          helperText={
                            touched.secciones &&
                            touched.secciones[index] &&
                            touched.secciones[index].contenido &&
                            errors.secciones?.[index]?.contenido
                          }
                          margin="normal"
                          multiline
                          rows={3}
                          sx={{
                            input: { color: theme === 'dark' ? '#fff' : '#000' },
                            label: { color: theme === 'dark' ? '#bbb' : '#000' },
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
              </div>
            )}
          </FieldArray>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ bgcolor: theme === 'dark' ? '#4caf50' : '#4caf50' }}
            >
              {editMode ? 'Crear Nueva Versión' : 'Agregar Término'}
            </Button>
            {editMode && (
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  handleReset();
                  setEditMode(false);
                  setCurrentVersion(null);
                }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </form>
      </FormikProvider>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Lista de Términos y Condiciones
      </Typography>
      <Paper sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff', boxShadow: 1 }}>
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
            {terminos.map((termino) => (
              <TableRow key={termino.id}>
                <TableCell>{termino.titulo}</TableCell>
                <TableCell>{termino.versio}</TableCell>
                <TableCell>
                  {new Date(termino.fechaVigencia).toLocaleDateString()}
                </TableCell>
                <TableCell>{termino.estado}</TableCell>
                <TableCell>
                  {termino.estado !== 'eliminado' && (
                    <>
                      <IconButton onClick={() => editTermino(termino)} color="warning">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteTermino(termino.id)} color="error">
                        <Delete />
                      </IconButton>
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

export default Terminos;
