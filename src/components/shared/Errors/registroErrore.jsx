import React, { Component } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadCry } from "@fortawesome/free-solid-svg-icons";
import "../../../css/Error.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
   
    this.logErrorToServer(error, errorInfo);
  }

  logErrorToServer(error, errorInfo) {
    axios
      .post(
        "https://alquiladora-romero-backed-1.onrender.com/api/logError",
        {
          error: error.toString(),
          errorInfo: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
        {
          withCredentials: true,
        }
      )
      .catch((err) => {
        console.error("Error al enviar el log de error al servidor:", err);
      });
  }

  render() {
    if (this.state.hasError) {
      // Interfaz de error personalizada
      return (
        <div className="error-container">
          <div className="error-content">
            <FontAwesomeIcon icon={faSadCry} className="error-icon" />
            <h1 className="error-title">¡Lo sentimos! Algo salió mal</h1>
            <p className="error-message">
              Estamos trabajando arduamente para solucionar el problema. Por favor, intenta recargar la página o volver más tarde.
            </p>
            <button className="error-button" onClick={() => window.location.reload()}>
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
