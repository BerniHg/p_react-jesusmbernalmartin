import React, { useContext, useState, useEffect } from "react";
import Barralat from "../components/Barralat";
import Chat from "../components/Chat";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import flechaIzquierda from "../img/flecha-izquierda.png";
import flechaDerecha from "../img/flecha-derecha.png";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import PaginaCarga from "../components/PaginaCarga";

const Menu = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [mostrarBarra, setMostrarBarra] = useState(true);
  const [cargando, setCargando] = useState(true);

  // Cambiar el estado de mostrarBarra al hacer clic en el botón
  const toggleMostrarBarra = () => {
    console.log(mostrarBarra);
    setMostrarBarra(!mostrarBarra); 
  };

  useEffect(() => {
    const habilitado = async () => {

      // Referencia al documento del usuario en Firebase Firestore
      const usuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid); 

       // Obtener el documento del usuario
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {

        // Obtener los datos del usuario
        const usuarioData = usuarioDocSnap.data(); 
        console.log(usuarioData.enable);
        if (!usuarioData.enable) {
          await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: false,
          });
          signOut(auth);
        }
      }
    };

    const connectUser = async () => {
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: true, // Actualizar el estado de conexión del usuario a "true"
          }));
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      }
    };

    const disconnectUser = async () => {
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: false, // Actualizar el estado de conexión del usuario a "false" al desconectar
          }));
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };

    const cargarDatos = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular una carga de datos durante 2 segundos
      setCargando(false); // Establecer el estado de carga a "false" después de cargar los datos
    };

    connectUser();
    habilitado();

    // Ejecutar la función habilitado cada 5 segundos para verificar el estado de habilitación
    const interval = setInterval(habilitado, 5000);

    // Manejar el evento antes de cerrar la ventana para desconectar al usuario
    window.addEventListener("beforeunload", disconnectUser); 

    cargarDatos();

    return () => {
      clearInterval(interval); // Limpiar el intervalo al desmontar el componente
      window.removeEventListener("beforeunload", disconnectUser); // Eliminar el eventListener antes de cerrar la ventana al desmontar el componente
    };
  }, [currentUser]); 

  return (
    <div className={`menu ${data.chatId === "null" ? "no_chat" : ""}`}>
      {cargando && <PaginaCarga />}
      <Barralat mostrarBarra={mostrarBarra} /> 
      <button
        className="boton-mostrar-barra"
        onClick={toggleMostrarBarra}
        style={data.chatId === "null" ? { display: "none" } : null} // Ocultar el botón si no hay un chat seleccionado
      >
        <img
          className="icono-flecha"
          src={mostrarBarra ? flechaIzquierda : flechaDerecha}
          alt={mostrarBarra ? "Ocultar barra lateral" : "Mostrar barra lateral"}
        />
      </button>
      <Chat />
    </div>
  );
};

export default Menu;
