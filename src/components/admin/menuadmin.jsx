import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, 
    faBuilding, 
    faShieldAlt, 
    faBalanceScale,  
    faFileSignature, 
    faExclamationTriangle,
    faSignOutAlt 
  } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from "react-router-dom";
// import CrudUsuarios from "../crudUsuarios/crudUsuarios";
// import CrudPerfil from "../perfil/crudPerfil";
import DatosEmpresa from "../admin/datosEmpresa/datosEmpresa";
// import Slider from "../slider/slide";
// import PoliticasPrivacidad from "../datosEmpresa/politicasPrivacidad";
// import Restaurantes from "../restaurantes/restaurantes";
// import DetallesComedor from "../restaurantes/detallesRestauarnte";
import "../../css/admin/inicioMenu.css";
// import { useAuth } from "../../shared/layaouts/contextoLocalStore";
// import PersonalizarCorreo from "../personalizacionCorreo/personarCorrreo";

const InicioAdm = () => {
  const [selectedSection, setSelectedSection] = useState("");
  const navigate = useNavigate();
  const [selectedSubSection, setSelectedSubSection] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);

//   const { user, logout } = useAuth();

  const renderContent = () => {
//     if (showRestaurantDetails) {
//       return (
//         <DetallesComedor
//           restaurant={selectedRestaurant}
//           onBack={() => setShowRestaurantDetails(false)}
//         />
//       );
//     }

    switch (selectedSection) {
      case "perfil":
        // return <CrudPerfil />;
      case "correo":
        // return <PersonalizarCorreo />;
      case "usuarios":
        // return <CrudUsuarios />;
      case "datosEmpresa":
        return <DatosEmpresa />;
      case "politicasPrivacidad":
        // return <PoliticasPrivacidad />;
      //case "comedores":
      // return (
        //   <Restaurantes
        //     onSelectSubSection={setSelectedSubSection}
        //     selectedSubSection={selectedSubSection}
        //     setSelectedRestaurant={setSelectedRestaurant}
        //     setShowRestaurantDetails={setShowRestaurantDetails}
        //   />
      //  );
      case "slider":
        // return <Slider />;
      case "cerrarSesion":
      //  handleLogout();
        return null;
      default:
        return (
          <div style={{ textAlign: "center", padding: "20px" }}>
            {/* <h1>Bienvenido {u?.username} a administrador Plaza del Sabor</h1> */}
            <img
              src="https://res.cloudinary.com/dj3gv2rch/image/upload/v1720053789/Imagenes/yjays5fad1djaehaujun.webp"
              alt="Plaza del Sabor Logo"
              style={{ width: "150px", margin: "20px auto" }}
            />
            <p>Disfruta de la mejor experiencia gastronómica</p>
          </div>
        );
    }
  };

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setShowRestaurantDetails(false);

  }
  


  return (
    <div className="perfil-restaurante">
      <Sidebar onSelect={handleSelectSection}  setShowRestaurantDetails={setShowRestaurantDetails} />
      <div className="content">{renderContent()}</div>
    </div>
  );
}



const Sidebar = ({ onSelect, user, setShowRestaurantDetails }) => {
  return (
    <div className="sidebar">
      <div className="profile-info">
        <div className="profile-pic">
          {user?.foto_perfil ? (
            <img src={user.foto_perfil} alt="Profile" />
          ) : (
            <FontAwesomeIcon icon={faUser} size="4x" />
          )}
        </div>
        <div className="country-flag">
          <div>
            <p>
              <FontAwesomeIcon icon={faUser} /> {user?.username}
            </p>
            <p>Administrador</p>
          </div>
        </div>
      </div>
      <div className="menu">
    <ul>
      <li onClick={() => { onSelect("usuarios"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faUser} className="icon" /> Usuarios
      </li>
      <li onClick={() => { onSelect("datosEmpresa"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faBuilding} className="icon" /> Datos de la Empresa
      </li>
      <li onClick={() => { onSelect("politicasPrivacidad"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faShieldAlt} className="icon" /> Políticas y Privacidad
      </li>
      <li onClick={() => { onSelect("Deslinde legal"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faBalanceScale} className="icon" /> Deslinde legal
      </li>
      <li onClick={() => { onSelect("Terminos y Condiciones"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faFileSignature} className="icon" />Términos y Condiciones
      </li>
      <li onClick={() => { onSelect("Errores de sistema"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faExclamationTriangle} className="icon" /> Errores de sistema
      </li>
      <li onClick={() => { onSelect("cerrarSesion"); setShowRestaurantDetails(false); }}>
        <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Cerrar sesión
      </li>
    </ul>
  </div>
  </div>
  );
};

export default InicioAdm;
