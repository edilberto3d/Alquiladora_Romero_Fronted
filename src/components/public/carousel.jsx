import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import "../../css/carousel.css"; 

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: false,
          autoplaySpeed: 3000,
        }
      }
    ]
  };

  const slides = [
    { type: "image", src: require("../../img/carousel1.jpg"), alt: "Eventos Especiales" },
    { type: "image", src: require("../../img/carousel2.jpg"), alt: "Decoración Elegante" },
    { 
      type: "video", 
      src: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/ALQROMERO/videos/244413001925386",
      alt: "Video Testimonial" 
    },
    { type: "image", src: require("../../img/carousel5.jpg"), alt: "Ambientes Únicos" },
    { type: "image", src: require("../../img/carousel6.jpg"), alt: "Servicio Profesional" },
  ];

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="carousel-slide">
            {slide.type === "image" ? (
              <img 
                src={slide.src} 
                alt={slide.alt} 
                className="carousel-image animated-fade-in"
              />
            ) : (
              <iframe
                title={slide.alt}
                width="100%"
                height="500px"
                src={slide.src}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="carousel-video animated-fade-in"
              />
            )}
            <div className="carousel-overlay">
              <h2>{slide.alt}</h2>
              <button className="carousel-button">Contactar</button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
