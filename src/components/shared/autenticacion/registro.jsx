import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import zxcvbn from "zxcvbn";
import "../../../css/registroFinal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";

const Registro = ({ guardarCorreo }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();
  //Contraseña comprometida
  const [isCompromised, setIsCompromised] = useState(null);

  //Consulta genera de usuarios
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/usuarios")
      .then((response) => {
        console.log("Usuario cargados", response.data);
        setUsuarios(response.data);
      })
      .catch((error) => {
        console.log("Eror a cargar los usuarios", error);
      });
  }, []);

  // Función para validar los campos en tiempo real
  const validateField = (name, value) => {
    let error = "";
    if (
      name === "nombre" ||
      name === "apellidoPaterno" ||
      name === "apellidoMaterno"
    ) {
      if (!value.trim()) {
        error = "El dato es requerido";
      } else if (!/^[a-zA-Z\u00C0-\u00FF\s]+$/.test(value)) {
        error =
          "Por favor, use solo letras (incluidos acentos y ü) y espacios.";
      } else if (value.length < 3) {
        error = "El dato debe tener al menos 3 caracteres";
      } else if (value.length > 30) {
        error = "El dato no puede tener más de 30 caracteres";
      }
    } else if (name === "telefono") {
      if (!/^\d{10}$/.test(value)) {
        error = "El teléfono debe tener 10 dígitos.";
      }
    } else if (name === "contrasena") {
      if (!value) {
        error = "La contraseña es requerida.";
      } else if (value.length < 8) {
        error = "La contraseña debe tener al menos 8 caracteres.";
      }
      const passwordScore = zxcvbn(value).score;
      setPasswordStrengthScore(passwordScore);
    } else if (name === "confirmarContrasena") {
      if (value !== formData.contrasena) {
        error = "Las contraseñas no coinciden.";
      }
    }
    return error;
  };

  //=====================cONTRASEÑA COMPROMETIDA========================================================================
  const checkPassword = async (password) => {
    try {
      const hash = CryptoJS.SHA1(password).toString();
      const prefix = hash.slice(0, 5); 
      const suffix = hash.slice(5); 

      // Hacer la solicitud a la API de Have I Been Pwned
      const response = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );

      // Comprobar si el hash completo aparece en la respuesta
      const hashes = response.data.split("\n");
      const isFound = hashes.some((line) => {
        const [returnedHash] = line.split(":");
        return returnedHash.toLowerCase() === suffix;
      });

      setIsCompromised(isFound);
      return isFound;
    } catch (error) {
      console.error(
        "Error verificando la contraseña en Have I Been Pwned:",
        error
      );
      setIsCompromised(false);
      return false;
    }
  };

  //========================================================================================================

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && passwordStrengthScore === 4;
  };

  // Manejar cambios en los campos
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "contrasena" && value) {
      await checkPassword(value);
    }

    if (touchedFields[name]) {
      const error = validateField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  // Manejar cuando un campo es "tocado"
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Verificar si el formulario es válido y habilitar
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, passwordStrengthScore]);

  //===========================================================REgistro en la base de datos

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      
      const isPasswordCompromised = await checkPassword(formData.contrasena);
      if (isPasswordCompromised) {
        setErrors({
          contrasena: "Esta contraseña ha sido comprometida. Elige otra.",
        });
        return; // Detener el proceso de registro
      }
      //Realizamos el registro en la db
     
      const usuarioCorreo = usuarios.some(
        (usuarios) => usuarios.Correo === guardarCorreo
      );
      if (usuarioCorreo) {
        setErrors("Verficar Correo");
        console.log("Error el correo ya esta registardo");
      } else {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/usuarios",
            {
              nombre: formData.nombre,
              apellidoPaterno: formData.apellidoPaterno,
              apellidoMaterno: formData.apellidoMaterno,
              email: guardarCorreo,
              telefono: formData.telefono,
              contrasena: formData.contrasena,
            }
          );
          if (response.status == 201) {
            //
            Swal.fire({
              title: "¡Registro Correcto!",
              text: "Gracias por ser parte de la familia alquiladora romero.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "small-swal",
              },
              willClose: () => {
                console.log("La alerta se ha cerrado automáticamente");
              },
            });
            console.log("Registro exitoso");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error en el registro:", error);
          setErrors({
            api: "Hubo un error al registrar el usuario, intente más tarde.",
          });
        }
      }
    }
  };

  // Función para obtener el color de la barra de seguridad de la contraseña
  const getPasswordStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "red";
      case 1:
        return "orange";
      case 2:
        return "yellow";
      case 3:
        return "#9ACD32"; // yellowgreen
      case 4:
        return "green";
      default:
        return "lightgrey";
    }
  };

  // Función para obtener la descripción de la seguridad de la contraseña
  const getPasswordStrengthText = (score) => {
    switch (score) {
      case 0:
        return "Muy débil";
      case 1:
        return "Débil";
      case 2:
        return "Regular";
      case 3:
        return "Buena";
      case 4:
        return "Fuerte";
      default:
        return "";
    }
  };

  return (
    <div className="registro-container1">
      <Typography
        variant="h5"
        className="login-title"
        textAlign="center"
        marginBottom="15px"
      >
        Paso 4: Completa tu registro
      </Typography>

      <Alert
        severity="info"
        sx={{ marginBottom: "15px", textAlign: "left", fontSize: "0.875rem" }}
      >
        El número de teléfono proporcionado será utilizado para recuperar o
        cambiar la contraseña. Asegúrate de que sea un número real y accesible.
      </Alert>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        className="registro-form1"
      >
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            width: "100%",
          }}
        >
          <TextField
            label="Nombre *"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.nombre && touchedFields.nombre}
            helperText={touchedFields.nombre && errors.nombre}
          />
          <TextField
            label="Apellido Paterno *"
            name="apellidoPaterno"
            value={formData.apellidoPaterno}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.apellidoPaterno && touchedFields.apellidoPaterno}
            helperText={touchedFields.apellidoPaterno && errors.apellidoPaterno}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            width: "100%",
          }}
        >
          <TextField
            label="Apellido Materno"
            name="apellidoMaterno"
            value={formData.apellidoMaterno}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            error={!!errors.apellidoMaterno && touchedFields.apellidoMaterno}
            helperText={touchedFields.apellidoMaterno && errors.apellidoMaterno}
          />
          <TextField
            label="Teléfono *"
            name="telefono"
            value={formData.telefono}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              setFormData({
                ...formData,
                telefono: onlyNums.slice(0, 10),
              });
            }}
            onBlur={handleBlur}
            required
            fullWidth
            type="tel"
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]{10}",
              title: "Ingresa un número de teléfono válido de 10 dígitos",
            }}
            error={!!errors.telefono && touchedFields.telefono}
            helperText={touchedFields.telefono && errors.telefono}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            width: "100%",
          }}
        >
          <TextField
            label="Contraseña *"
            name="contrasena"
            type={showPassword ? "text" : "password"}
            value={formData.contrasena}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.contrasena && touchedFields.contrasena}
            helperText={touchedFields.contrasena && errors.contrasena}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirmar Contraseña *"
            name="confirmarContrasena"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmarContrasena}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={
              !!errors.confirmarContrasena && touchedFields.confirmarContrasena
            }
            helperText={
              touchedFields.confirmarContrasena && errors.confirmarContrasena
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {/* Mostrar si la contraseña está comprometida */}
        {isCompromised && (
          <Typography
            sx={{
              color: "red",
              fontSize: "0.8rem",
              fontStyle: "italic",
            }}
          >
            Error Utiliza otra contraseña
          </Typography>
        )}

        {/* Medidor de seguridad de la contraseña */}
        {formData.contrasena && (
          <Box sx={{ marginBottom: "1px", textAlign: "center" }}>
            {passwordStrengthScore < 4 && (
              <Typography
                sx={{
                  color: "red",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  marginBottom: "8px",
                }}
              >
                La contraseña debe ser "fuerte" para poder registrarte.
              </Typography>
            )}
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "0.9rem",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Seguridad de la contraseña:
              <span
                style={{
                  color: getPasswordStrengthColor(passwordStrengthScore),
                  marginLeft: "6px",
                }}
              >
                {getPasswordStrengthText(passwordStrengthScore)}
              </span>
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: "8px",
                borderRadius: "8px",
                backgroundColor: "#f0f0f0",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  height: "100%",
                  width: `${(passwordStrengthScore / 4) * 100}%`,
                  transition: "width 0.4s ease",
                  backgroundImage: `linear-gradient(to right, ${getPasswordStrengthColor(
                    passwordStrengthScore
                  )}, #f8f9fa)`,
                  borderRadius: "8px",
                }}
              />
            </Box>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isFormValid}
          sx={{ padding: "10px", fontSize: "0.9rem" }}
        >
          Completar Registro
        </Button>
      </Box>
    </div>
  );
};

export default Registro;
