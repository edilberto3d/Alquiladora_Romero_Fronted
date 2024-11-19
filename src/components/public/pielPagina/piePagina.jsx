import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons"; // Importar desde free-solid-svg-icons
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { ThemeContext } from "../../shared/layaouts/ThemeContext";
import { useAuth } from "../../shared/layaouts/AuthContext";

const PiePagina = () => {
  const { theme } = useContext(ThemeContext);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { user } = useAuth();
  const [empresa, setEmpresa] = useState({
    direccion: "",
    telefono: "",
    redes_sociales: {
      facebook: "",
      instagram: "",
      web: ""
    },
  });

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/empresa", {
          withCredentials: true,
        });
        
        const empresaData = response.data;
        
        // Parseamos la cadena de redes sociales
        const redesSocialesParsed = JSON.parse(empresaData.redes_sociales);

        // Establecemos los enlaces específicos en el estado de `empresa`
        setEmpresa({
          direccion: empresaData.direccion,
          telefono: empresaData.telefono,
          redes_sociales: {
            facebook: redesSocialesParsed.new_social_1 || "", // Facebook
            web: redesSocialesParsed.new_social_2 || "", // Página web
            instagram: "https://www.instagram.com/alquiladoraromero", // Instagram predeterminado
          }
        });
      } catch (error) {
        console.error("Error al obtener datos de la empresa:", error);
      }
    };
    fetchEmpresaData();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: theme === "light" ? "#D4A017" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        padding: "40px 20px",
        marginTop: "auto",
      }}
    >
      {/* Mapa de ubicación y Preguntas Frecuentes en línea */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Mapa de ubicación */}
        <Grid item xs={12} md={6}>
          <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
            {!mapLoaded && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme === "light" ? "#f0f0f0" : "#555",
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0199543221065!2d-122.08385168468291!3d37.38605197983002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5c1dce9292f%3A0xb7b479b2ba6c5f6b!2sGoogleplex!5e0!3m2!1sen!2sus!4v1638895942395!5m2!1sen!2us"
              width="100%"
              height="300px"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Mapa de ubicación"
              onLoad={() => setMapLoaded(true)}
              onError={() => {
                setMapLoaded(true);
                console.error("Error al cargar el mapa");
              }}
            ></iframe>
          </Box>
        </Grid>

        {/* Preguntas Frecuentes */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme === "light" ? "#000" : "#fff",
              mb: 2,
            }}
          >
            Preguntas Frecuentes
          </Typography>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="faq1-content"
              id="faq1-header"
            >
              <Typography>¿Cómo puedo rentar los servicios?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Puedes realizar tu solicitud de renta a través de nuestra página
                web o llamándonos directamente.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="faq2-content"
              id="faq2-header"
            >
              <Typography>¿Cuáles son los métodos de pago?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Aceptamos pagos con tarjeta de crédito, débito y transferencias
                bancarias.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Información de contacto, redes sociales, términos y políticas */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme === "light" ? "#000" : "#fff",
              mb: 1,
            }}
          >
            INFORMACIÓN DE LA EMPRESA
          </Typography>
          <Box>
            <Link
              to={user?.rol ? "/cliente/politicas" : "/politicas"}
              style={{
                textDecoration: "none",
                color: theme === "light" ? "#007bff" : "#4fc3f7",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Políticas y Privacidad
            </Link>
            <Link
              to={user?.rol ? "/cliente/terminos" : "/terminos"}
              style={{
                textDecoration: "none",
                color: theme === "light" ? "#007bff" : "#4fc3f7",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Términos y Condiciones
            </Link>
            <Link
              to={user?.rol ? "/cliente/deslin" : "/deslin"}
              style={{
                textDecoration: "none",
                color: theme === "light" ? "#007bff" : "#4fc3f7",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Deslinde legal
            </Link>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme === "light" ? "#000" : "#fff",
            }}
          >
            CONTACTO
          </Typography>
          <Typography>Teléfono: {empresa.telefono}</Typography>
          <Typography>Dirección: {empresa.direccion}</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme === "light" ? "#000" : "#fff",
            }}
          >
            SÍGUENOS EN NUESTRAS REDES
          </Typography>
          <Box sx={{ display: "flex", gap: "15px", mt: 1 }}>
            <a
              href={empresa.redes_sociales.facebook || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FontAwesomeIcon
                icon={faFacebook}
                size="2x"
                style={{ color: theme === "light" ? "#3b5998" : "#8b9dc3" }}
              />
            </a>
            <a
              href={empresa.redes_sociales.instagram || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FontAwesomeIcon
                icon={faInstagram}
                size="2x"
                style={{ color: theme === "light" ? "#C13584" : "#e1306c" }}
              />
            </a>
            <a
              href={empresa.redes_sociales.web || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sitio web"
            >
              <FontAwesomeIcon
                icon={faGlobe}
                size="2x"
                style={{ color: theme === "light" ? "#1DA1F2" : "#00aced" }}
              />
            </a>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography
          variant="body2"
          sx={{ color: theme === "light" ? "#000" : "#fff" }}
        >
          © 2024 Alquiladora Romero
        </Typography>
      </Box>
    </Box>
  );
};

export default PiePagina;
