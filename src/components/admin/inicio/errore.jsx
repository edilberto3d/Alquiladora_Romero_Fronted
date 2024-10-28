import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, Paper, Grid, Alert, AlertTitle, Divider, IconButton, Tooltip, Button } from '@mui/material';
import { ErrorOutline, Refresh, ArrowBack, ArrowForward } from '@mui/icons-material';
import { ThemeContext } from "../../shared/layaouts/ThemeContext";

const ErrorLogs = () => {
  const { theme } = useContext(ThemeContext); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 3;
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      setError('No se pudieron cargar los logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Calculate the logs to display on the current page
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <Box p={3} maxWidth="1200px" margin="auto">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: theme === 'dark' ? '#fff' : '#333' }}>
          <ErrorOutline color="error" /> Registros de Errores
        </Typography>
        <Tooltip title="Recargar logs">
          <IconButton onClick={fetchLogs}>
            <Refresh color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      ) : logs.length === 0 ? (
        <Alert severity="info" variant="outlined">
          No hay registros de errores disponibles.
        </Alert>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {currentLogs.map((log, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    padding: 3, 
                    borderRadius: 2, 
                    bgcolor: theme === 'dark' ? '#333' : '#f9f9f9', 
                    height: '100%' 
                  }}
                >
                  <Alert severity="error" icon={false} sx={{ bgcolor: theme === 'dark' ? '#2e2e2e' : '#fdecea', border: '1px solid #f5c6cb' }}>
                    <AlertTitle>
                      <Box display="flex" alignItems="center">
                        <ErrorOutline fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="h6" color="error.main" sx={{ fontSize: '1.1rem' }}>
                          Error - {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </AlertTitle>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
                      Mensaje: {log.message}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ccc' : 'text.secondary' }}>
                      Detalles: {log.stack || 'Sin detalles adicionales.'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      <strong>Fuente:</strong> {log.source || 'Desconocida'}
                    </Typography>
                  </Alert>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination controls */}
          <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              sx={{ marginRight: 2 }}
            >
              Anterior
            </Button>
            <Typography variant="body1" color="text.secondary">
              Página {currentPage} de {totalPages}
            </Typography>
            <Button
              endIcon={<ArrowForward />}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              sx={{ marginLeft: 2 }}
            >
              Siguiente
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ErrorLogs;
