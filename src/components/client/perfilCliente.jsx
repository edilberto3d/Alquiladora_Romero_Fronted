import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Grid,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Paper,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Snackbar,
  CircularProgress,
  Alert,
  Modal,
  Button,
  useTheme,
  ListItemIcon,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import axios from "axios";
import SettingsIcon from "@mui/icons-material/Settings";
import { Toast } from "primereact/toast";
import "../../css/perfilCliente.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { validateName, validatePhone } from "./dialogos/validalaciones";
import EditableInput from "./dialogos/EditableInput";
import CambiarContrasenaModal from "./change/cambiarpass";
import MFAComponent from "./Mfa/mfa";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

import {
  faWindows,
  faAndroid,
  faLinux,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TabletMacIcon from "@mui/icons-material/TabletMac";

const PerfilUsuarioPrime = () => {
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false); // Estado de MFA
  const [profileData, setProfileData] = useState([]);
  //Constatnte s para actualizar el foto de perfil
  const [usuariosC, setUsuariosC] = useState([]);
  const toast = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [openMfaModal, setOpenMfaModal] = useState(false);
  const theme = useTheme();
  const [activo, setActivo] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  

  // Obtenemos los datos del usuario desde el backend

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get(
        "https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token",
        { withCredentials: true }
      );
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error("Error al obtener el token CSRF:", error);
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/perfil",
        {
          withCredentials: true,
        }
      );
      setUsuariosC(response.data.user);
      setActivo(!!response.data.user.mfa_secret);
      setLastUpdated(new Date(response.data.user.Fecha_ActualizacionF));
      setLoading(false);
      console.log("Esto e sloque obtengo de usuarioC", response.data.user);
    } catch (error) {
      setLoading(false);
      console.error("Error al obtener los datos del perfil:", error);
    }
  };
  //LLAMAMOS LA FUNCION
  useEffect(() => {
    fetchProfileData();
    fetchCsrfToken();
  }, []);

  // Función para mostrar alertas con PrimeReact
  const showToast = (severity, summary, detail) => {
    toast.current.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 4000,
      sticky: false,
      className:
        severity === "success"
          ? "toast-success"
          : severity === "error"
          ? "toast-error"
          : "toast-info",
    });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setOpenModal(false);
    fetchProfileData();
  };

  //=======================================================================================
  //Function para actualizar el foto de perfil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const now = new Date();
    if (file) {
      const lastUpdatedTime = lastUpdated?.getTime();
      const twoMonths = 60 * 60 * 24 * 1000 * 30 * 2;
      if (lastUpdated && now - lastUpdatedTime < twoMonths) {
        showToast(
          "error",
          "Acción no permitida",
          "Solo puedes cambiar tu foto de perfil cada dos meses."
        );
        return;
      }
      if (!["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"].includes(file.type)) {
        showToast(
          "error",
          "Formato de imagen inválido",
          "Solo se aceptan imágenes en formatos PNG, JPG, JPEG, GIF, WEBP, o SVG."
        );
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        showToast(
          "error",
          "Tamaño Excesivo",
          "El tamaño de la imagen debe ser menor a 2MB."
        );
        return;
      }
      handleImageChange(file);
    }
  };

  const handleImageChange = async (file) => {
    const now = new Date();

    const formData = new FormData();
    formData.append("imagen", file);

    setUploading(true);
    setIsBlocked(true);
    showToast(
      "info",
      "Subiendo Imagen",
      "Espera mientras se sube la imagen..."
    );

    try {
      const response = await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/imagenes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      const imageUrl = response.data.url;
      console.log("URL de la imagen subida:", imageUrl);

      // Actualizar el perfil con la nueva URL de la imagen en MySQL
      await axios.patch(
        `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/perfil/${usuariosC.id}/foto`,
        {
          foto_perfil: imageUrl,
          fecha_actualizacionF: now.toISOString(),
        },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      // Actualizar el estado del frontend con la nueva imagen
      setUsuariosC((prevProfile) => ({
        ...prevProfile,
        foto_perfil: imageUrl,
      }));

      setLastUpdated(now);
      fetchProfileData();
      showToast(
        "success",
        "Imagen Subida",
        "Foto de perfil actualizada correctamente."
      );
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      showToast("error", "Error", "Error al actualizar la foto de perfil.");
    } finally {
      setUploading(false);
      setIsBlocked(false);
      setUploadProgress(0);
    }
  };

  //===================GUARDAR EN LA BASE DE DATOS=======================================================================
  const saveField = async (field, value) => {
    console.log("VALOR DE FILE, VALUE", field, value);
    try {
      // Asegúrate de que el valor se envíe correctamente en el cuerpo de la solicitud
      const response = await axios.patch(
        `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/perfil/${usuariosC.id}/${field}`,
        { value },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      fetchProfileData();

      showToast(
        "success",
        `${field} actualizado`,
        `El ${field} ha sido guardado correctamente.`
      );
    } catch (error) {
      showToast(
        "error",
        "Error al guardar",
        `Hubo un error al guardar el ${field}.`
      );
      console.error(`Error al guardar el ${field}:`, error);
    }
  };

  //==========================================================================================
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenMfaModal = () => {
    setOpenMfaModal(true);
  };

  // Función para cerrar el modal
  const handleCloseMfaModal = () => {
    setOpenMfaModal(false);
  };

  //===================SESIONES=======================================================================
  const fetchSessions = async () => {
    console.log("Este es el id de sesiones abiertas", usuariosC.id);
    try {
      const response = await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/sesiones",
        { userId: usuariosC.id },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true , timeout: 10000 }
      );
      setSessions(response.data);
      console.log("Sesiones abiertas:", response.data);
    } catch (error) {
      console.error("Error al obtener las sesiones activas:", error);
    }
  };

  const closeAllSessions = async () => {
    const deviceTime = new Date().toISOString();

    try {
      await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/cerrar-todas-sesiones",
        { userId: usuariosC.id, deviceTime },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true, timeout: 10000 }
      );
      setSessions(sessions.filter((session) => session.isCurrent));
      toast.current.show({
        severity: "success",
        summary: "Sesiones cerradas",
        detail: "Todas las sesiones excepto la actual han sido cerradas.",
        life: 3000, 
      });
    } catch (error) {
      console.error("Error al cerrar todas las sesiones:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cerrar todas las sesiones.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    let intervalId;

    if (usuariosC.id) {
      fetchSessions(); 
      intervalId = setInterval(() => {
        fetchSessions();
      },100000); 
    }

    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [usuariosC]);

  const getDeviceIcon = (deviceType) => {
    if (deviceType === "Windows") return <FontAwesomeIcon icon={faWindows} />;
    if (deviceType === "Android") return <FontAwesomeIcon icon={faAndroid} />;
    if (deviceType === "Linux") return <FontAwesomeIcon icon={faLinux} />;
    if (deviceType === "Mac") return <FontAwesomeIcon icon={faApple} />;
    if (deviceType === "iOS") return <PhoneIphoneIcon />;
    if (deviceType === "iPad") return <TabletMacIcon />;
    return <ComputerIcon />;
  };

  //==========================================================================================

  // Renderizamos el contenido solo si ya tenemos los datos cargados
  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando datos del perfil...
        </Typography>
      </Grid>
    );
  }

  return (
    <>
     <Toast ref={toast} position="top-right" />
      <Toast ref={toast} position="top-right" />
      {isBlocked && (
        <>
          <div className="blocked-overlay"></div>
          <div className="overlay">
            <CircularProgress
              size={120}
              thickness={6}
              sx={{ color: "#1976d2" }}
            />
            <Typography variant="h6" color="white" sx={{ mt: 2 }}>
              Actualizando Imagen.....
            </Typography>
          </div>
        </>
      )}

      <Grid container justifyContent="center" sx={{ mt: 4, mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {/* Imagen de perfil y nombre */}
            <Grid
              container
              alignItems="center"
              direction="column"
              spacing={2}
              mb={3}
            >
              <Grid item>
                <h1>Bienvenido</h1>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    alt="Foto de Perfil"
                    src={usuariosC.foto_perfil}
                    sx={{ width: 150, height: 150 }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <CameraAltIcon />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Typography variant="h5" component="div" gutterBottom>
                  {usuariosC.nombre} {usuariosC.apellidoP}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {usuariosC.correo}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Tabs para Información, Seguridad, Configuración */}
            <Box sx={{ width: "100%" }}>
              <Tabs value={activeTab} onChange={handleTabChange} centered>
                <Tab icon={<PersonIcon />} label="Datos Personales" />
                <Tab icon={<SecurityIcon />} label="Seguridad" />
                {/* <Tab icon={<SettingsIcon />} label="Preferencias" /> */}
              </Tabs>

              {/* Panel de Información Personal */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <>
                        <EditableInput
                          label="Nombre"
                          value={usuariosC?.nombre || ""}
                          validate={(value) => validateName(value, "nombre")}
                          onSave={(newNombre) => saveField("nombre", newNombre)}
                        />
                      </>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <EditableInput
                        label="Apellido Paterno"
                        value={usuariosC?.apellidoP || ""}
                        validate={(value) =>
                          validateName(value, "apellido paterno")
                        }
                        onSave={(newApellidoP) =>
                          saveField("apellidoP", newApellidoP)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <EditableInput
                        label="Apellido Materno"
                        value={usuariosC?.apellidoM || ""}
                        validate={(value) =>
                          validateName(value, "apellido materno")
                        }
                        onSave={(newApellidoM) =>
                          saveField("apellidoM", newApellidoM)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <EditableInput
                        label="Teléfono"
                        value={usuariosC?.telefono || ""}
                        validate={validatePhone}
                        onSave={(newPhone) => saveField("telefono", newPhone)}
                        showHint={true}
                        hintMessage="Ingrese su número de teléfono real para recuperación de cuenta."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Panel de Seguridad */}
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6">Seguridad</Typography>

                  <Grid container spacing={2}>
                    <CambiarContrasenaModal
                      open={openModal}
                      onClose={handleCloseModal}
                      usuario={usuariosC}
                    />

                    {/* Contraseña */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Contraseña"
                        type="password"
                        value="************"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleOpenModal}>
                                <FontAwesomeIcon icon={faEdit} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Autenticación Multifactor (MFA) */}
                    <Grid item xs={12} md={7}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor:
                            theme === "light" ? "#f5f5f5" : "#424242",
                          boxShadow: 1,
                          textAlign: "left",
                          mb: 2,
                          color: theme === "light" ? "#000" : "#fff",
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Autenticación Multifactor
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Requiere un desafío de seguridad adicional al iniciar
                          sesión. Si no puedes pasar este desafío, tendrás la
                          opción de recuperar tu cuenta por correo electrónico.
                        </Typography>
                        <Button
                          variant="contained"
                          color={activo ? "secondary" : "primary"}
                          onClick={handleOpenMfaModal}
                          sx={{ width: "auto", minWidth: "200px" }}
                        >
                          {activo ? "Desactivar MFA" : "Activar MFA"}
                        </Button>
                      </Box>

                      {/* Modal para configuración de MFA */}
                      <Modal
                        open={openMfaModal}
                        onClose={handleCloseMfaModal}
                        aria-labelledby="modal-mfa-title"
                        aria-describedby="modal-mfa-description"
                      >
                        <Box
                          sx={{
                            bgcolor: "background.paper",
                            p: 4,
                            borderRadius: 2,
                            boxShadow: 24,
                            maxWidth: 500,
                            mx: "auto",
                            mt: "10%",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            id="modal-mfa-title"
                            variant="h6"
                            gutterBottom
                          >
                            Configuración de Autenticación Multifactor
                          </Typography>
                          <MFAComponent userId={usuariosC.id}  setActivo={setActivo}/>

                          <Button
                            onClick={handleCloseMfaModal}
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            fullWidth
                          >
                            Cerrar
                          </Button>
                        </Box>
                      </Modal>
                    </Grid>

                    {/* Lista de Sesiones Abiertas */}
                    <Grid item xs={12} md={8}>
                      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Sesiones Abiertas
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Revisa dónde tienes la sesión abierta. Puedes cerrar
                          sesiones innecesarias.
                        </Typography>

                        <List>
                          {/* Sesión actual */}
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            Sesión Actual
                          </Typography>
                          {sessions
                            .filter((session) => session.isCurrent)
                            .map((session, index) => (
                              <ListItem key={`current-${index}`}>
                                <ListItemIcon>
                                  {getDeviceIcon(session.tipoDispositivo)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={`Dispositivo: ${session.tipoDispositivo}`}
                                  secondary={`IP: ${
                                    session.direccionIP
                                  } `}
                                />
                              </ListItem>
                            ))}

                          <Divider sx={{ my: 2 }} />

                          {/* Otras sesiones activas */}
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Otras Sesiones Activas
                          </Typography>
                          {sessions.filter((session) => !session.isCurrent)
                            .length > 0 ? (
                            sessions
                              .filter((session) => !session.isCurrent)
                              .map((session, index) => (
                                <ListItem key={`other-${index}`}>
                                  <ListItemIcon>
                                    {getDeviceIcon(session.tipoDispositivo)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`Dispositivo: ${session.tipoDispositivo}`}
                                    secondary={`IP: ${
                                      session.direccionIP
                                    } `}
                                  />
                                </ListItem>
                              ))
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ ml: 2, color: "text.secondary" }}
                            >
                              No hay otras sesiones activas.
                            </Typography>
                          )}

                          {/* Botón para cerrar todas las demás sesiones */}
                          {sessions.filter((session) => !session.isCurrent)
                            .length > 0 && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={closeAllSessions}
                              startIcon={
                                <FontAwesomeIcon icon={faSignOutAlt} />
                              }
                              sx={{
                                mt: 2,
                                textTransform: "none",
                                fontSize: "14px",
                                alignSelf: "flex-start",
                              }}
                            >
                              Cerrar otras sesiones
                            </Button>
                          )}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Panel de Configuración */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  {/* Aquí irían los campos de configuración */}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PerfilUsuarioPrime;
