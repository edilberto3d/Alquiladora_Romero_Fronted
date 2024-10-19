import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LayaoutEncabezado from './components/shared/layaouts/encabezados'

//==================================PUBLICO=====================================================================
import Inicio from "./components/public/incio";
import Login from "./components/shared/autenticacion/login";
import Registro from "./components/shared/autenticacion/registro";
import {ProcesoRegistro } from "./components/shared/autenticacion/procesoRegistro";


//==================================CLIENTE=====================================================================
import  InicioCliente  from "./components/client/inicioCliente.jsx";

//===========================Rutas Privados=================================
import  RutaPrivada  from "./components/shared/layaouts/contextoAutentication.jsx";
import ErrorBoundary from "./components/shared/Errors/registroErrore.jsx";

function App() {
  return (
    <>
    <ErrorBoundary>
     <Routes>
      <Route path="/" element={<LayaoutEncabezado><Inicio /> </LayaoutEncabezado>} />
      <Route path="/login" element={<LayaoutEncabezado><Login /> </LayaoutEncabezado>} />
      <Route path="/RegistroValidacionCorreo" element={<LayaoutEncabezado><ProcesoRegistro  /> </LayaoutEncabezado>} />
      <Route path="/registro" element={<LayaoutEncabezado><Registro /> </LayaoutEncabezado>} />

         {/* Rutas para Cliente */}
         <Route path="/cliente" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< Inicio /></LayaoutEncabezado></RutaPrivada>  }/>
         {/* <Route path="/cliente/perfil" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< UserProfile /></LayaoutEncabezado></RutaPrivada>  }/> */}

      </Routes> 
      </ErrorBoundary>
     
          {/* <Header/> */}
        
    </>
  );
}

export default App;
