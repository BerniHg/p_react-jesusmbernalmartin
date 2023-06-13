import React, { useState, useContext, useEffect } from "react";
import UsuariosOrg from "../components/UsuariosOrg";
import UsuariosCrear from "../components/UsuariosCrear";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import PaginaCarga from "../components/PaginaCarga";

const Admin = () => {
  const { currentUser } = useContext(AuthContext);
  const [seleccionado, setSeleccionado] = useState("usuariosOrg");
  const [cargando, setCargando] = useState(true); 

  const navigate = useNavigate();

  const handleClick = (seccion) => {

    // Función para manejar el clic en los botones de sección
    if (seleccionado === seccion) {
      setSeleccionado("");
    } else {
      setSeleccionado(seccion);
    }
  };

  useEffect(() => {

    const habilitado = async () => {

      // Verificar si el usuario está habilitado
      const usuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();

        if (!usuarioData.enable) {
          signOut(auth); // Cerrar sesión si el usuario no está habilitado
        }
      }
    };

    const connectUser = async () => {

      // Conectar al usuario cuando se carga el componente
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: true,
          }));
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      } finally {
        setCargando(false);
      }
    };

    const disconnectUser = async () => {

      // Desconectar al usuario cuando el componente se desmonta o se recarga la página
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: false,
          }));
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };

    connectUser(); // Conectar al usuario al cargar el componente
    habilitado(); // Verificar si el usuario está habilitado

    const interval = setInterval(habilitado, 5000); // Verificar periódicamente el estado de habilitación

    window.addEventListener("beforeunload", disconnectUser); // Manejar la desconexión cuando se recarga la página o se cierra la pestaña

    return () => {
      clearInterval(interval); // Limpiar el intervalo al desmontar el componente
      window.removeEventListener("beforeunload", disconnectUser); // Eliminar el manejador de eventos al desmontar el componente
    };
  }, [currentUser]);

  const handleBackButton = () => {
    // Manejar el clic en el botón de regresar
    navigate("/");
  };

  if (cargando) {
    return <PaginaCarga />;
  }

  return (
    <div className="admin-container">
      <div className="admin-buttons">
        <button className="backButton" onClick={handleBackButton}>
          Regresar
        </button>
        <button
          onClick={() => handleClick("usuariosOrg")}
          disabled={seleccionado === "usuariosOrg"} // Deshabilitar el botón si la sección ya está seleccionada
        >
          Organizar usuarios
        </button>
        <button
          onClick={() => handleClick("usuariosCrear")}
          disabled={seleccionado === "usuariosCrear"} // Deshabilitar el botón si la sección ya está seleccionada
        >
          Crear usuarios
        </button>
      </div>
      <div className="admin-content">
        {seleccionado === "usuariosOrg" && <UsuariosOrg />}
        {seleccionado === "usuariosCrear" && <UsuariosCrear />}
      </div>
    </div>
  );
};

export default Admin;
