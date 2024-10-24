import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../public/header.jsx';
import PiePagina from '../../public/pielPagina/piePagina.jsx';


const LayaoutEncabezado=({children})=>{
    const location= useLocation();
    let encabezado;
    let pieDePagina;

    if(location.pathname.startsWith('/administrador')){
        encabezado=<Header/>;
        pieDePagina=<PiePagina/>;
    }else if(location.pathname.startsWith('/cliente')){
        encabezado=<Header />;
        pieDePagina=<PiePagina />;
    }else{
        encabezado= < Header />
        pieDePagina= <PiePagina/>
    }

    return(
        <>
        {encabezado}
        <div>
            {children}
            {pieDePagina}
        </div>
        
        
        </>
    )
}

export default LayaoutEncabezado;