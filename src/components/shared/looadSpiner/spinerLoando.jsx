import React, { useContext } from 'react';
import logo from '../../../img/carousel1.jpg';
import '../../../css/loadingSpinner.css';
import { ThemeContext } from '../layaouts/ThemeContext';

const LoadingSpinner = () => {
    const { theme } = useContext(ThemeContext);
  
    return (
      <div className={`loading-container ${theme}`}>
        <img src={logo} alt="Alquiladora Romero Logo" className="loading-image" />
        <p className="loading-text">Cargando... Alquiladora Romero</p>
      </div>
    );
  };

export default LoadingSpinner;
