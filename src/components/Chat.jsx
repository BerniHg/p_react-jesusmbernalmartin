import React, { useContext, useState } from "react";
import Mensajes from "./Mensajes";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import Telefono from "../img/telefono.png";
import Puntos from "../img/puntos.png";

const Chat = () => {
  const { data } = useContext(ChatContext);
  console.log(data);

  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    console.log("Handle");
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="chat"
      style={data.chatId === "null" ? { display: "none" } : null}>
      <div className="chatinfo">
        <div className="chatusuario">
          <img className="chatimagen" src={data.usuario?.photoURL} alt="" />
          <span className="chatnombre">{data.usuario?.displayName}</span>
        </div>
        <div className="chatopciones">
          <img className="llamada" src={Telefono} alt="" />
          <img
            className="ajustes"
            src={Puntos}
            alt=""
            onClick={handleButtonClick}
          />
          {isOpen && (
            <div className="opcionesmenu">
              <p>Eliminar contacto</p>
              <p>Cambiar nombre</p>
            </div>
          )}
        </div>
      </div>

      <Mensajes />
      <Input />
    </div>
  );
};

export default Chat;
