import React, { Component } from "react";
import axios from "axios";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enviar el error al backend para que lo registre
    axios.post("http://localhost:3001/api/logError", {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    }).catch(err => {
      console.error("Error al enviar el log de error al servidor:", err);
    });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo salió mal.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
