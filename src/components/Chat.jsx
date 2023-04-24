import React, { useContext } from "react";
import Mensajes from "./Mensajes";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import Telefono from "../img/telefono.png";
import Puntos from "../img/puntos.png"

const Chat = () => {
  const { data } = useContext(ChatContext);
  console.log(data);

  return (
    <div
      className="chat"
      style={data.chatId === "null" ? { display: "none" } : null}
    >
      <div className="chatinfo">
        <img className="chatimagen" src={data.usuario?.photoURL} alt="" />
        <span className="chatnombre">{data.usuario?.displayName}</span>
        <div className="chatopciones">
          <img className="llamada" src={Telefono} alt="" />
          <img className="ajustes" src={Puntos} alt="" />
        </div>
      </div>

      <Mensajes />
      <Input />
    </div>
  );
};

export default Chat;
