import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idUsuario } = location.state || {};
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompromised, setIsCompromised] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener token CSRF
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

  // Función para validar la contraseña comprometida y la fortaleza
  const checkPasswordCompromised = async (password) => {
    try {
      const hash = CryptoJS.SHA1(password).toString();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split("\n");
      const isFound = hashes.some((line) => {
        const [returnedHash] = line.split(":");
        return returnedHash.toLowerCase() === suffix;
      });

      setIsCompromised(isFound);
      return isFound;
    } catch (error) {
      console.error("Error verificando la contraseña comprometida:", error);
      setIsCompromised(false);
      return false;
    }
  };

  // Validar las contraseñas cada vez que cambian los inputs
  useEffect(() => {
    const validatePasswords = async () => {
      let isValid = true;
      let validationError = "";

      if (!newPassword || newPassword.length < 8) {
        validationError = "La contraseña debe tener al menos 8 caracteres.";
        isValid = false;
      } else {
        const passwordScore = zxcvbn(newPassword).score;
        setPasswordStrengthScore(passwordScore);

        if (await checkPasswordCompromised(newPassword)) {
          validationError = "Esta contraseña ha sido comprometida. Elige otra.";
          isValid = false;
        } else if (passwordScore < 3) {
          validationError = "La contraseña debe ser más fuerte.";
          isValid = false;
        } else {
          validationError = "";
        }
      }

      if (newPassword !== confirmPassword) {
        validationError = "Las contraseñas no coinciden.";
        isValid = false;
      }

      setError(validationError);
      setIsButtonDisabled(!isValid);
    };

    validatePasswords();
  }, [newPassword, confirmPassword]); 

  // Verificar contraseña actual
  const handlePasswordVerification = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/usuarios/verify-password",
        { currentPassword, idUsuario },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      if (response.data.valid) {
        setIsVerified(true);
        setError("");
        Swal.fire({
          icon: "success",
          title: "Contraseña actual verificada",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setError("La contraseña actual es incorrecta.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La contraseña actual es incorrecta.",
        });
      }
    } catch (err) {
      setError("Error al verificar la contraseña actual.");
    }
  };

  // Función para obtener el color según la fortaleza de la contraseña
  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "red";
      case 1:
        return "orange";
      case 2:
        return "yellow";
      case 3:
        return "lightgreen";
      case 4:
        return "green";
      default:
        return "gray";
    }
  };

  // Cambiar la contraseña
  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/usuarios/change-password",
        { idUsuario, newPassword },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Contraseña actualizada!",
          text: "Tu contraseña ha sido cambiada correctamente. Y tus secciones se cerraron",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsLoading(false);
        navigate("/cliente/perfil");
      } else if (response.data.usedBefore) {
        setError("Ya has utilizado esta contraseña anteriormente.");
        setIsLoading(false);
      } else {
        setError("Error al cambiar la contraseña.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error al cambiar la contraseña.");
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "500px",
        margin: "80px auto",
        padding: "2rem",
        bgcolor: "background.paper",
        boxShadow: 2,
        borderRadius: 2,
        minHeight: "300px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Cambiar Contraseña</Typography>
        <IconButton onClick={() => navigate("/cliente/perfil")}>
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
      )}

      {!isVerified ? (
        <>
          <Typography sx={{ mb: 2 }}>Ingresa tu contraseña actual para continuar.</Typography>
          <TextField
            label="Contraseña Actual"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <FontAwesomeIcon icon={showCurrentPassword ? faEye : faEyeSlash} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handlePasswordVerification}>
            Verificar Contraseña Actual
          </Button>
        </>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>Ahora puedes ingresar tu nueva contraseña.</Typography>

          <TextField
            label="Nueva Contraseña"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LinearProgress
            variant="determinate"
            value={(passwordStrengthScore / 4) * 100}
            sx={{
              mb: 2,
              bgcolor: "lightgray",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getStrengthColor(passwordStrengthScore),
              },
            }}
          />
          <Typography sx={{ color: getStrengthColor(passwordStrengthScore) }}>
            Fortaleza de contraseña: {["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"][passwordStrengthScore]}
          </Typography>

          {isCompromised && (
            <Typography sx={{ color: "red", fontSize: "0.875rem", mt: 1 }}>
              Esta contraseña ha sido comprometida. Elige otra.
            </Typography>
          )}

          <TextField
            label="Confirmar Nueva Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePasswordChange}
            disabled={isButtonDisabled || isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Cambiar Contraseña"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default ChangePassword;
