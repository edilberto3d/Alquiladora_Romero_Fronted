import React, { useState, useEffect, useContext } from "react";
import "../../../css/registro.css";
import ReCAPTCHA from "react-google-recaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck,
  faArrowRight,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ValidarCorreo } from "./validarCorreo";
import { Token } from "./token";
import Registro from "./registro";
import { ThemeContext } from "../layaouts/ThemeContext";

const ProcesoRegistro = () => {
  const [step, setStep] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [guardarCorreo, setGuardarCorreo] = useState("");
  const { theme } = useContext(ThemeContext);

  const handleNextStep = () => {
    console.log("Este es el valor de guaradar correo", guardarCorreo);
    setAnimate(true);
    setTimeout(() => {
      setStep(step + 1);
      setAnimate(false);
    }, 100);
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundColor: theme === "light" ? "#f5f5f5" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        paddingBottom: "80px",
      }}
    >
      <div
        className={`login-box ${animate ? "fade-out" : "slide-in"}`}
        style={{
          backgroundColor: theme === "light" ? "#fff" : "#444",
          color: theme === "light" ? "#000" : "#fff",
          border: theme === "light" ? "1px solid #ddd" : "1px solid #666",
          marginBottom: "20px",
        }}
      >
        {/* Barra de progreso con colores distintos para cada estado */}
        {step >= 2 && (
          <div className="progress-bar">
            {/* Paso 1 */}
            <div
              className={`circle ${step > 1 ? "completed" : ""} ${
                step === 2 ? "active" : ""
              }`}
            >
              {step >= 2 ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  style={{ color: "green" }}
                />
              ) : (
                "1"
              )}
            </div>
            <div className={`line ${step >= 2 ? "completed" : ""}`}></div>

            {/* Paso 2 */}
            <div
              className={`circle ${step > 2 ? "completed" : ""} ${
                step === 3 ? "active" : ""
              }`}
            >
              {step >= 3 ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  style={{ color: "green" }}
                />
              ) : (
                "2"
              )}
            </div>
            <div className={`line ${step >= 3 ? "completed" : ""}`}></div>

            {/* Paso 3 */}
            <div
              className={`circle ${step > 3 ? "completed" : ""} ${
                step === 4 ? "active" : ""
              }`}
            >
              {step >= 4 ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  style={{ color: "green" }}
                />
              ) : (
                "3"
              )}
            </div>
          </div>
        )}

        {/** Paso 1 - Introducción y comenzar */}
        {step === 1 && (
          <>
            <h2 className="login-title">
              <FontAwesomeIcon icon={faUserCheck} className="icono-titulo" />
              Proceso de Registro
            </h2>
            <p
              className="description"
              style={{
                color: theme === "light" ? "#000" : "#fff",
              }}
            >
              Regístrate en la plataforma y obtén los beneficios de ser parte de
              la familia Alquiladora Romero. Sigue estos sencillos pasos para
              completar tu registro:
            </p>
            <ul className="steps-list">
              <li>
                <strong>1.</strong> Ingresa tu correo y completa el reCAPTCHA.
              </li>
              <li>
                <strong>2.</strong> Recibe un código en tu correo e ingrésalo
                para continuar.
              </li>
              <li>
                <strong>3.</strong> Completa tus datos personales y finaliza el
                registro.
              </li>
            </ul>{" "}
            {/* Botón "Siguiente" */}
            <button className="next-btn" onClick={handleNextStep}>
              Comenzar <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </>
        )}

        {/** Paso 2 - Validación del correo */}
        {step === 2 && (
          <ValidarCorreo
            onValidationSuccess={handleNextStep}
            setGuardarCorreo={setGuardarCorreo}
          />
        )}

        {/** Paso 3 - Validación del token */}
        {step === 3 && <Token onValidationSuccess={handleNextStep} />}

        {/** Paso 4 - Registro final */}
        {step === 4 && <Registro guardarCorreo={guardarCorreo} />}
      </div>
    </div>
  );
};

export { ProcesoRegistro };
