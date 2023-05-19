import React, { useContext, useState, useEffect } from "react";
import Barralat from "../components/Barralat";
import Chat from "../components/Chat";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import flechaIzquierda from "../img/flecha-izquierda.png";
import flechaDerecha from "../img/flecha-derecha.png";
import { doc, updateDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";

const Menu = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [mostrarBarra, setMostrarBarra] = useState(true);

  const toggleMostrarBarra = () => {
    console.log(mostrarBarra);
    setMostrarBarra(!mostrarBarra);
  };

  useEffect(() => {
    const connectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: true,
        });
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      }
    };
  
    const disconnectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: false,
        });
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };
  
    connectUser();
  
    window.addEventListener("beforeunload", disconnectUser);
  
    return () => {
      window.removeEventListener("beforeunload", disconnectUser);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  return (
    <div className={`menu ${data.chatId === "null" ? "no_chat" : ""}`}>
      <Barralat mostrarBarra={mostrarBarra} />
      <button
        className="boton-mostrar-barra"
        onClick={toggleMostrarBarra}
        style={data.chatId === "null" ? { display: "none" } : null}
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
