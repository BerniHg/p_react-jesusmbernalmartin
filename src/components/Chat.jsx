import { baseDatos } from "../firebase";
import React, { useContext, useState, useEffect } from "react";
import Mensajes from "./Mensajes";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Puntos from "../img/puntos.png";
// import { isDisabled } from "@testing-library/user-event/dist/utils";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  console.log(data);

  //const regexNombreUsuario = /^[a-zA-Z0-9_-]{4,16}$/;

  const [isOpen, setIsOpen] = useState(false);
  const [nameClicked, setNameClicked] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [connected, setConnected] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNameClicked = () => {
    setIsOpen(!isOpen);
    setNameClicked(!nameClicked);
  };

  const eliminarUsuario = async () => {
    /*
    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId]: null,
    });
    */
  };

  const cambiarNombre = async () => {
    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId + ".infoUsuario.displayName"]: nuevoNombre,
    });

    setNameClicked(!nameClicked);

    document.getElementById("usuario_nombre").innerHTML = nuevoNombre;
  };

  useEffect(() => {
    const fetchConnected = async () => {
      try {
        const userDoc = await getDoc(
          doc(baseDatos, "usuarios", data.usuario.uid)
        );
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const connectedValue = userData.connected || false;
          setConnected(connectedValue);
        }
      } catch (error) {
        console.log("Error al obtener el valor de connected:", error);
      }
    };

    fetchConnected();

    const interval = setInterval(fetchConnected, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [data.usuario.uid]);

  return (
    <div
      className="chat"
      style={data.chatId === "null" ? { display: "none" } : null}
    >
      <div className="chatinfo">
        <div className="chatusuario">
          <img
            className={`chatimagen ${
              connected
                ? "conectado"
                : data.usuario.displayName !== "ChatGPT"
                ? "desconectado"
                : ""
            }`}
            src={data.usuario?.photoURL}
            alt={data.usuario?.displayName}
          />

          {!nameClicked ? (
            <span className="chatnombre" id="usuario_nombre">
              {data.usuario?.displayName}
            </span>
          ) : (
            <>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(event) => setNuevoNombre(event.target.value)}
                id="nuevoNombre"
              />
              <input type="button" value="Cambiar" onClick={cambiarNombre} />
            </>
          )}
        </div>
        {data.usuario.displayName !== "ChatGPT" && (
          <div className="chatopciones">
            <img
              className="ajustes"
              src={Puntos}
              alt=""
              onClick={handleButtonClick}
            />
            {isOpen && (
              <div className="opcionesmenu">
                <p onClick={eliminarUsuario}>Eliminar contacto</p>
                <p onClick={handleNameClicked}>Cambiar nombre</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Mensajes />
      <Input />
    </div>
  );
};

export default Chat;
