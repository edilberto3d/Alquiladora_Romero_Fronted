import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const slides = [
    { type: "image", src: require("../../img/carousel1.jpg"), alt: "Imagen 1" },
    { type: "image", src: require("../../img/carousel2.jpg"), alt: "Imagen 2" },
    { 
      type: "video", 
      src: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/ALQROMERO/videos/244413001925386", // Usa la URL de incrustación
      alt: "Video de Facebook" 
    },
    { type: "image", src: require("../../img/carousel5.jpg"), alt: "Imagen 5" },
    { type: "image", src: require("../../img/carousel6.jpg"), alt: "Imagen 6" },
    { type: "image", src: require("../../img/carousel7.jpg"), alt: "Imagen 7" },
    { type: "image", src: require("../../img/carousel8.jpg"), alt: "Imagen 8" },
    { type: "image", src: require("../../img/carousel9.jpg"), alt: "Imagen 9" },
    { type: "image", src: require("../../img/carousel10.jpg"), alt: "Imagen q10" },
    


    
    { type: "image", src: require("../../img/carousel4.jpg"), alt: "Imagen 3" },
    { type: "image", src: require("../../img/carousel5.jpg"), alt: "Imagen 4" },
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
                className="carousel-image" 
              />
            ) : (
                <iframe
                title={slide.alt}
                width="100%"
                height="1000" 
                src={slide.src}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="carousel-video"
              />
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
