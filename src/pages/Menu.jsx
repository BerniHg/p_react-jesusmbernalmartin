import React, { useContext, useState } from "react";
import Barralat from "../components/Barralat";
import Chat from "../components/Chat";
import { ChatContext } from "../context/ChatContext";
import flechaIzquierda from "../img/flecha-izquierda.png";
import flechaDerecha from "../img/flecha-derecha.png";

const Menu = () => {
  const { data } = useContext(ChatContext);
  const [mostrarBarra, setMostrarBarra] = useState(true);

  const toggleMostrarBarra = () => {
    console.log(mostrarBarra);
    setMostrarBarra(!mostrarBarra);
  };

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
