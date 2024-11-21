import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import LayaoutEncabezado from './components/shared/layaouts/encabezados'
import  ThemeProvider  from './components/shared/layaouts/ThemeContext.jsx'; 
import { AuthProvider } from "./components/shared/layaouts/AuthContext.jsx";
import ConnectionStatus from './components/shared/Errors/ConnectionStatus.jsx'
//==================================PUBLICO=====================================================================
import Inicio from "./components/public/incio";
import Login from "./components/shared/autenticacion/login";
import Registro from "./components/shared/autenticacion/registro";
import {ProcesoRegistro } from "./components/shared/autenticacion/procesoRegistro";
import {ValidarCorreoRecuperacion} from './components/shared/autenticacion/recuperacionPass/recuperarPass.jsx'
import {TokenModalP} from './components/shared/autenticacion/recuperacionPass/cambiarPass.jsx'
import CambiarPass from "./components/shared/autenticacion/recuperacionPass/cambiarP.jsx";
import Politicas from "./components/public/PolitasP.jsx";
import TerminosList from './components/public/terminosP.jsx'
import Deslin from './components/public/deslinP.jsx'
import LoadingSpinner from "./components/shared/looadSpiner/spinerLoando.jsx";

//==================================CLIENTE=====================================================================
import  PerfilCliente from "./components/client/perfilCliente.jsx";
import { TokenModal } from "./components/client/change/tokenPassword.jsx";
import ChangePassword from "./components/client/change/password.jsx";
import Terminos from './components/admin/terminos/terminos.jsx'

//==================================ADMINSITRADOR=====================================================================
import InicioAdm from './components/admin/menuadmin.jsx'
import HistorialPoliticas from "./components/admin/politicas/historialP.jsx";
import HistorialDeslindeLegal from "./components/admin/deslin/historialD.jsx";
import HistorialTerminos from "./components/admin/terminos/historialTerminos.jsx";

//===========================Rutas Privados=================================
import  RutaPrivada  from "./components/shared/layaouts/contextoAutentication.jsx";
import ErrorBoundary from "./components/shared/Errors/registroErrore.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  //Show a cargara la pagina
  useEffect(() => {
    //A cRAGAR LA PAGINA
    const timer=setTimeout(()=>setLoading(false), 2000);
    return()=>clearTimeout(timer);
  },[]);

  return (

    <>
    <AuthProvider>
    < ThemeProvider>
    <ConnectionStatus />
    <ErrorBoundary>
      {loading?(
        <LoadingSpinner></LoadingSpinner>
      ):(
        <>
         <Routes>
      <Route path="/" element={<LayaoutEncabezado><Inicio /> </LayaoutEncabezado>} />
      <Route path="/login" element={<LayaoutEncabezado><Login /> </LayaoutEncabezado>} />
      <Route path="/RegistroValidacionCorreo" element={<LayaoutEncabezado><ProcesoRegistro  /> </LayaoutEncabezado>} />
      <Route path="/registro" element={<LayaoutEncabezado><Registro /> </LayaoutEncabezado>} />
      <Route path="/recuperarPass" element={<LayaoutEncabezado><ValidarCorreoRecuperacion /> </LayaoutEncabezado>} />
      <Route path="/tokenPassword" element={<LayaoutEncabezado><TokenModalP /> </LayaoutEncabezado>} />
      <Route path="/politicas" element={<LayaoutEncabezado><Politicas /> </LayaoutEncabezado>} />
      <Route path="/terminos" element={<LayaoutEncabezado><TerminosList/> </LayaoutEncabezado>} />
      <Route path="/deslin" element={<LayaoutEncabezado><Deslin/> </LayaoutEncabezado>} />
      
      <Route path="/updatePass" element={<LayaoutEncabezado><CambiarPass /> </LayaoutEncabezado>} />
       
         {/* Rutas para Cliente */}
         <Route path="/cliente" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< Inicio /></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/perfil" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< PerfilCliente/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/cambiarPassword" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< TokenModal/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/updatePass" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< ChangePassword/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/politicas" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< Politicas/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/terminos" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< TerminosList/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/deslin" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< Deslin/></LayaoutEncabezado></RutaPrivada>  }/>
            {/* Rutas para Cliente */}
            <Route path="/Administrador" element={ <RutaPrivada rolesPermitidos={['Administrador']}> <LayaoutEncabezado>< InicioAdm /></LayaoutEncabezado></RutaPrivada>  }/>
            <Route path="/Administrador/historialPoliticas" element={ <RutaPrivada rolesPermitidos={['Administrador']}> <LayaoutEncabezado>< HistorialPoliticas /></LayaoutEncabezado></RutaPrivada>  }/>
            <Route path="/Administrador/historialDeslindeLegal" element={ <RutaPrivada rolesPermitidos={['Administrador']}> <LayaoutEncabezado>< HistorialDeslindeLegal/></LayaoutEncabezado></RutaPrivada>  }/>
            <Route path="/Administrador/historialTerminos" element={ <RutaPrivada rolesPermitidos={['Administrador']}> <LayaoutEncabezado>< HistorialTerminos/></LayaoutEncabezado></RutaPrivada>  }/>
       </Routes>         
         </>

      )}
      </ErrorBoundary>
      </ThemeProvider>
      </AuthProvider>
     
          {/* <Header/> */}
        
    </>
  );
}

export default App;
