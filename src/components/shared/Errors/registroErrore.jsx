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
    // Obtener el token CSRF antes de enviar el error al backend
    axios
      .get("http://localhost:3001/api/get-csrf-token", { withCredentials: true })
      .then((response) => {
        const csrfToken = response.data.csrfToken;

        // Enviar el error al backend para que lo registre, junto con el token CSRF
        this.logErrorToServer(error, errorInfo, csrfToken);
      })
      .catch((err) => {
        console.error("Error al obtener el token CSRF:", err);

        // Opción de enviar el error sin token CSRF en caso de fallo
        this.logErrorToServer(error, errorInfo);
      });
  }

  // Función para enviar el error al servidor
  logErrorToServer(error, errorInfo, csrfToken = null) {
    const config = {
      withCredentials: true,
    };

    if (csrfToken) {
      config.headers = {
        "X-CSRF-Token": csrfToken,
      };
    }

    axios
      .post(
        "http://localhost:3001/api/logError",
        {
          error: error.toString(),
          errorInfo: errorInfo.componentStack,
        },
        config
      )
      .catch((err) => {
        console.error("Error al enviar el log de error al servidor:", err);
      });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-content">
            {/* Icono de carrito triste */}
            <FontAwesomeIcon icon={faSadCry} className="error-icon" />
            
            <h1 className="error-title">¡Lo sentimos! Algo salió mal</h1>
            <p className="error-message">
              Estamos trabajando arduamente para solucionar el problema. Por
              favor, intenta recargar la página o volver más tarde.
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
