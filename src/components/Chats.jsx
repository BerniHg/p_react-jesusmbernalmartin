import React, { useContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(baseDatos, "chatsUsuarios", currentUser.uid),
        (doc) => {
          setChats(doc.data());
        }
      );
  
      return unsub; // Devuelve la función de desuscripción
    };
  
    const fetchConnected = async () => {
      try {
        const userDoc = await getDoc(
          doc(baseDatos, "usuarios", data.usuario.uid)
        );
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.connected) {
            setConnected(userData.connected);
          }
        }
      } catch (error) {
        console.log("Error al obtener el valor de connected:", error);
      }
    };
  
    const interval = setInterval(fetchConnected, 5000);
  
    currentUser.uid && getChats();
    fetchConnected();
  
    return () => {
      clearInterval(interval);
    };
  }, [currentUser.uid, data.usuario.uid]);
  
  
  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => {
          return (
            <div
              className="chatusuario"
              key={chat[0]}
              onClick={() => handleSelect(chat[1].infoUsuario)}
            >
              <img
                src={chat[1].infoUsuario.photoURL}
                alt={chat[1].infoUsuario.displayName}
                className={`chatimagen ${
                  connected ? "conectado" : (data.usuario.displayName !== "ChatGPT" ? "desconectado" : "")
                }`}
              />
              <div className="chatinfo">
                <span>{chat[1].infoUsuario.displayName}</span>
                <p>{chat[1].ultimoMens?.text}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Chats;
