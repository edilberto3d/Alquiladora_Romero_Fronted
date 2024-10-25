import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LayaoutEncabezado from './components/shared/layaouts/encabezados'
import  ThemeProvider  from './components/shared/layaouts/ThemeContext.jsx'; 
import { AuthProvider } from "./components/shared/layaouts/AuthContext.jsx";

//==================================PUBLICO=====================================================================
import Inicio from "./components/public/incio";
import Login from "./components/shared/autenticacion/login";
import Registro from "./components/shared/autenticacion/registro";
import {ProcesoRegistro } from "./components/shared/autenticacion/procesoRegistro";
import {ValidarCorreoRecuperacion} from './components/shared/autenticacion/recuperacionPass/recuperarPass.jsx'
import {TokenModalP} from './components/shared/autenticacion/recuperacionPass/cambiarPass.jsx'
import CambiarPass from "./components/shared/autenticacion/recuperacionPass/cambiarP.jsx";

//==================================CLIENTE=====================================================================
import  PerfilCliente from "./components/client/perfilCliente.jsx";
import { TokenModal } from "./components/client/change/tokenPassword.jsx";
import ChangePassword from "./components/client/change/password.jsx";

//==================================ADMINSITRADOR=====================================================================
import InicioAdm from './components/admin/menuadmin.jsx'

//===========================Rutas Privados=================================
import  RutaPrivada  from "./components/shared/layaouts/contextoAutentication.jsx";
import ErrorBoundary from "./components/shared/Errors/registroErrore.jsx";

function App() {
  return (
    <>
    <AuthProvider>
    < ThemeProvider>
    <ErrorBoundary>
     <Routes>
      <Route path="/" element={<LayaoutEncabezado><Inicio /> </LayaoutEncabezado>} />
      <Route path="/login" element={<LayaoutEncabezado><Login /> </LayaoutEncabezado>} />
      <Route path="/RegistroValidacionCorreo" element={<LayaoutEncabezado><ProcesoRegistro  /> </LayaoutEncabezado>} />
      <Route path="/registro" element={<LayaoutEncabezado><Registro /> </LayaoutEncabezado>} />
      <Route path="/recuperarPass" element={<LayaoutEncabezado><ValidarCorreoRecuperacion /> </LayaoutEncabezado>} />
      <Route path="/tokenPassword" element={<LayaoutEncabezado><TokenModalP /> </LayaoutEncabezado>} />
      
      <Route path="/updatePass" element={<LayaoutEncabezado><CambiarPass /> </LayaoutEncabezado>} />
       
         {/* Rutas para Cliente */}
         <Route path="/cliente" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< Inicio /></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/perfil" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< PerfilCliente/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/cambiarPassword" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< TokenModal/></LayaoutEncabezado></RutaPrivada>  }/>
         <Route path="/cliente/updatePass" element={ <RutaPrivada rolesPermitidos={['Cliente']}> <LayaoutEncabezado>< ChangePassword/></LayaoutEncabezado></RutaPrivada>  }/>

            {/* Rutas para Cliente */}
            <Route path="/Administrador" element={ <RutaPrivada rolesPermitidos={['Administrador']}> <LayaoutEncabezado>< InicioAdm /></LayaoutEncabezado></RutaPrivada>  }/>
      </Routes> 
      </ErrorBoundary>
      </ThemeProvider>
      </AuthProvider>
     
          {/* <Header/> */}
        
    </>
  );
}

export default App;
