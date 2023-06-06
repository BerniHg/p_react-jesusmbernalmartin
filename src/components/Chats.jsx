import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { format, isToday, isYesterday } from 'date-fns';
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(baseDatos, "chatsUsuarios", currentUser.uid),
        (doc) => {
          setChats(doc.data());
        }
      );

      return unsub;
    };

    currentUser.uid && getChats();
  }, [currentUser.uid, data.usuario.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  function formatDateWithDay(date) {
    const formattedDate = new Date(date.seconds * 1000);
    const hours = formattedDate.getHours();
    const minutes = formattedDate.getMinutes();
  
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    if (isToday(formattedDate)) {
      return `Hoy ${formattedHours}:${formattedMinutes}`;
    } else if (isYesterday(formattedDate)) {
      return `Ayer ${formattedHours}:${formattedMinutes}`;
    } else {
      return `${format(formattedDate, 'dd/MM/yyyy')} ${formattedHours}:${formattedMinutes}`;
    }
  }

  return (
    <div className="chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => {
          const nombre = chat[1].infoUsuario.displayName;
          return (
            <div
              className="chatusuario"
              key={chat[0]}
              onClick={() => handleSelect(chat[1].infoUsuario)}
            >
              <img
                src={chat[1].infoUsuario.photoURL}
                alt={nombre}
                className={`chatimagen`}
              />
              <div className="chatinfo">
                <span>{chat[1].infoUsuario.displayName}</span>
                <p>
                  {chat[1].ultimoMens?.senderId === currentUser.uid && "Tú: "}
                  {chat[1].ultimoMens?.text}
                </p>
                <p className="hora">{chat[1].ultimoMens?.date?.seconds && formatDateWithDay(chat[1].ultimoMens.date)}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Chats;
