import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { ThemeContext } from "../../shared/layaouts/ThemeContext";
import Swal from "sweetalert2";

const UsuariosSospechosos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const { theme } = useContext(ThemeContext);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Obtener el token CSRF
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };

    fetchCsrfToken();

    // Obtener usuarios sospechosos desde el endpoint
    const fetchUsuariosSospechosos = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/usuarios/usuarios-sospechosos", {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios sospechosos:", error);
      }
    };

    fetchUsuariosSospechosos();
  }, [csrfToken]);

  // Función para bloquear/desbloquear usuario
  const handleToggleBlock = async (idUsuario, bloqueado) => {
    const url = bloqueado
      ? `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/desbloquear/${idUsuario}`
      : `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/bloquear/${idUsuario}`;

    try {
      await axios.post(url, {}, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });
      Swal.fire({
        icon: "success",
        title: bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado",
        showConfirmButton: false,
        timer: 1500,
      });
      // Actualizar el estado de bloqueo del usuario en la lista
      setUsuarios(usuarios.map(user =>
        user.idUsuarios === idUsuario ? { ...user, bloqueado: !bloqueado } : user
      ));
    } catch (error) {
      console.error("Error al cambiar el estado de bloqueo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cambiar el estado de bloqueo",
        text: error.response?.data?.message || "Intenta de nuevo",
      });
    }
  };

  return (
    <TableContainer component={Paper}
      style={{
        backgroundColor: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#000" : "#fff"
      }}
    >
      <h2 style={{ textAlign: "center", color: theme === "light" ? "#000" : "#fff" }}>
        Usuarios Sospechosos
      </h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido Paterno</TableCell>
            <TableCell>Intentos</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.idUsuarios} style={{ backgroundColor: usuario.bloqueado ? "#f8d7da" : "#d4edda" }}>
              <TableCell>{usuario.Nombre}</TableCell>
              <TableCell>{usuario.ApellidoP}</TableCell>
              <TableCell>{usuario.Intentos}</TableCell>
              <TableCell>{usuario.Correo}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color={usuario.bloqueado ? "secondary" : "primary"}
                  onClick={() => handleToggleBlock(usuario.idUsuarios, usuario.bloqueado)}
                >
                  {usuario.bloqueado ? "Desbloquear" : "Bloquear"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsuariosSospechosos;
