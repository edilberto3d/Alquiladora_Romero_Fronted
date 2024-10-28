import React, { useContext } from 'react';
import Carousel from './carousel';
import '../../css/carousel.css';
import { ThemeContext } from '../shared/layaouts/ThemeContext';

const Inicio = () => {
    const { theme } = useContext(ThemeContext);

  return (
    <>
      <div>
        <Carousel />
      </div>

       <div className={`categories-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <h2 className="categories-title">Alquiler de Mobiliario para Eventos</h2>
        <p className="categories-subtitle">
          Contamos con una extensa variedad de mobiliario y equipo en renta, todo para su evento.
        </p>
        <div className="categories-container">
          {[
            { src: 'carousel1.jpg', alt: 'Sillas y Mesas', title: 'SILLAS Y MESAS' },
            { src: 'carousel11.png', alt: 'Carpas y Domos', title: 'CARPAS, DOMOS Y LONAS' },
            { src: 'carousel12.png', alt: 'Periqueras Vintage', title: 'PERIQUERAS VINTAGE' },
            { src: 'carousel4.jpg', alt: 'Salas Lounge', title: 'SALAS LOUNGE VINTAGE' },
            { src: 'carousel13.png', alt: 'Inflables y Brincolines', title: 'INFLABLES Y BRINCOLINES' },
            { src: 'carousel6.jpg', alt: 'Otros Artículos en Renta', title: 'OTROS ARTÍCULOS EN RENTA' }
          ].map((item, index) => (
            <div
              className="category-item animated-fade-up"
              key={index}
              style={{ '--order': index }}
            >
              <img src={require(`../../img/${item.src}`)} alt={item.alt} />
              <h3>{item.title}</h3>
              <button className="quote-button">Cotizar</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Inicio;
