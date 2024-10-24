import React, { useState, useEffect, useRef } from "react";
import { faEnvelope, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from 'crypto-js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReCAPTCHA from "react-google-recaptcha";
import { Alert, AlertTitle } from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "../../../css/registro.css"

export const ValidarCorreo = ({ onValidationSuccess , setGuardarCorreo}) => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [email, setEmail] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const secretKey = 'TokenValidation2024';
  const [captchaHasError, setCaptchaHasError] = useState(false);
  const recaptchaRef = useRef(null);
  const [csrfToken, setCsrfToken] = useState("");
  


  // Consulta de los usuarios registrados
  // Obtener el token CSRF desde el backend
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/get-csrf-token', { withCredentials: true });
        setCsrfToken(response.data.csrfToken); 
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    getCsrfToken();

    const ConsultarUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar los usuarios: ", error);
      }
    };

    ConsultarUsuarios();
  }, []);

  //=======================CAPTCHAP===============================
  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
    setErrorMessage("");
  };

 // Manejar error al cargar el CAPTCHA
 const handleCaptchaError = () => {
  setErrorMessage("Error al cargar el reCAPTCHA, por favor intenta de nuevo.");
  setCaptchaHasError(true);
};

  // Validar formato de correo usando el servidor====================================================================
  const isValidEmail = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/email/validate-email",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken  
          },
          body: JSON.stringify({ email }),
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.isValid ? "Email is valid" : "Email is not valid");
      return data.isValid;
    } catch (error) {
      console.error("Error validating email:", error.message);
      return false;
    }
  };

  //Encriptamos el Token en locasltore=======================================================
  const storeEncryptedToken = (token) => {
    const expirationTime = new Date().getTime() + 15 * 60 * 1000; 
    const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
    localStorage.setItem("encryptedToken", encryptedToken);
    localStorage.setItem("tokenExpiration", expirationTime);
  };



  // Validar correo y CAPTCHA antes de enviar===================================================
  const handleValidation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!captchaValue) {
      setErrorMessage("Por favor completa el reCAPTCHA.");
      setLoading(false);
      return;
    }

    // Validar el formato del correo
    const emailIsValid = await isValidEmail(email);
    if (!emailIsValid) {
      setErrorMessage("Correo Invalido.");
      setLoading(false);
      return;
    }

    // Validar si el CAPTCHA fue completado
    if (!captchaValue) {
      setErrorMessage("Completa todos los campos.");
      setLoading(false);
      return;
    }

    const usuarioCorreo = usuarios.some((usuario) => {
      const correoBD = usuario.Correo.toLowerCase().trim(); 
      const correoInput = email.toLowerCase().trim(); 
      console.log(`Comparando BD: ${correoBD} con Input: ${correoInput}`); 
      return correoBD === correoInput;
    });
    
    if (usuarioCorreo) {
      setErrorMessage("Utiliza otro correo.");
      setLoading(false);
      return;
    }


    //Creams el token
    const shortUUID = uuidv4().substring(0, 6);
   
    try {
       // Guardar el token encriptado en localStorage
       storeEncryptedToken(shortUUID);
      // Envío de correo con el token
      await axios.post(
        "http://localhost:3001/api/email/send",
        {
          correo: email,
          captchaToken: captchaValue,
          shortUUID: shortUUID,
          nombreU: "Bienvenido",
          nombreR: "",
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,  
          },
          withCredentials: true,
        }
      );
      //Guardamos el correo en una variable
      setGuardarCorreo(email);
      console.log("Este es el correo ", setGuardarCorreo)

      // Muestra el mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Token enviado al correo!',
        showConfirmButton: true,
        customClass: {
          popup: 'small-swal' 
        }
      }).then(() => {
        if (onValidationSuccess) {
          onValidationSuccess();
        }
      });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error.message);

      setErrorMessage("Lo sentimos, vuelve a intentar mas tarde.");
      //Restablesemos el captcha
      recaptchaRef.current.reset(); 


    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="validate-container">
        <h2 className="login-title">Paso 1: Ingresa tu correo</h2>
        <form onSubmit={handleValidation}>

          {errorMessage && (
            <div className="custom-alert-error">
              <FontAwesomeIcon icon={faExclamationCircle} className="alert-icon" />
              <span className="alert-title">Error:</span>
              <span className="alert-message">{errorMessage}</span>
            </div>
          )}

          <div className="form-group icon-input">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                id="email"
                name="correo"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
            </div>
          </div>

          <ReCAPTCHA
           ref={recaptchaRef}
            className="recaptcha-container"
            sitekey="6Le0dGAqAAAAAPQMdd-d6ZH8nZWTgC9HEHpO6R-7"
            onChange={onCaptchaChange}
            onErrored={handleCaptchaError}
          />


         <button type="submit" className="validate-btn" disabled={loading}>
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Validando...
            </>
          ) : (
            <>
              Validar <FontAwesomeIcon icon={faCheckCircle} />
            </>
          )}
        </button>


        </form>

      </div>

    </>
  );
};
