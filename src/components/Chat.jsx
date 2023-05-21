import { baseDatos } from "../firebase";
import React, { useContext, useState, useEffect } from "react";
import Mensajes from "./Mensajes";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Telefono from "../img/telefono.png";
import Puntos from "../img/puntos.png";
import Videollamada from "./Videollamada";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  console.log(data);

  const [isOpen, setIsOpen] = useState(false);
  const [nameClicked, setNameClicked] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [connected, setConnected] = useState(false);
  const [showVideollamada, setVideollamada] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNameClicked = () => {
    setIsOpen(!isOpen);
    setNameClicked(!nameClicked);
  };

  const handleVideollamadaClick = () => {
    setVideollamada(true);
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
  }, [data.usuario.uid]);

  return (
    <>
      {showVideollamada ? (
        <Videollamada
          currentUser={currentUser}
          contactoUsuario={data.usuario}
          offeringCall={callInProgress}
          answeringCall={callInProgress}
        />
      ) : (
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
                  />
                  <input
                    type="button"
                    value="Cambiar"
                    onClick={cambiarNombre}
                  />
                </>
              )}
            </div>
            {data.usuario.displayName !== "ChatGPT" && (
              <div className="chatopciones">
                {callInProgress ? (
                  <p>En proceso de llamada...</p>
                ) : (
                  <img
                    className="llamada"
                    src={Telefono}
                    alt=""
                    onClick={() => {
                      setCallInProgress(true);
                      handleVideollamadaClick();
                    }}
                  />
                )}
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
      )}
    </>
  );
};

export default Chat;
