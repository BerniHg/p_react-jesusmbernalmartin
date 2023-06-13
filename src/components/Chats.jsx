import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
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
    // Función para obtener los chats del usuario actual desde Firebase
    const getChats = async () => {
      const docRef = doc(baseDatos, "chatsUsuarios", currentUser.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        setChats(doc.data());
      });

      return unsubscribe;
    };

    // Verificar si el usuario actual ha iniciado sesión y obtener los chats
    if (currentUser.uid) {
      getChats();
    }
  }, [currentUser.uid, data.usuario.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  // Formatear la fecha y mostrar "Hoy", "Ayer" o la fecha completa
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
      {/* Iterar sobre los chats y renderizar componentes ChatUsuario */}
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => {
          return (
            <ChatUsuario
              key={chat[0]}
              chat={chat[1]}
              currentUser={currentUser}
              handleSelect={handleSelect}
              formatDateWithDay={formatDateWithDay}
            />
          );
        })}
    </div>
  );
};

const ChatUsuario = ({ chat, currentUser, handleSelect, formatDateWithDay }) => {
  const [n_usuario, setNUsuario] = useState("");
  const [img_usuario, setImgUsuario] = useState("");
  const [email_usuario, setEmailUsuario] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    // Obtener información del usuario asociado al chat
    const obtenerUsuario = async () => {
      try {
        const userDoc = await getDoc(
          doc(baseDatos, "usuarios", chat.infoUsuario.uid)
        );

        const userEliminatedDoc = await getDoc(
          doc(baseDatos, "usuariosEliminados", chat.infoUsuario.uid)
        );
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNUsuario(userData.displayName);
          setImgUsuario(userData.photoURL);
          setEmailUsuario(userData.email);
          setState(userData.connected);
        }
        else if (userEliminatedDoc) {
          const userData = userEliminatedDoc.data();
          setNUsuario(userData.displayName);
          setImgUsuario(userData.photoURL);
          setEmailUsuario(userData.email);
          setState(userData.connected);
        }
      } catch (error) {
        console.error("Error al obtener el documento del usuario:", error);
      }
    };

    // Obtener el usuario y establecer un intervalo para actualizar la información
    obtenerUsuario();

    const interval = setInterval(obtenerUsuario, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [chat]);

  return (
    <div
      className="chatusuario"
      onClick={() => handleSelect(chat.infoUsuario)}
    >
      <img
        src={img_usuario}
        alt={n_usuario}
        className={`chatimagen ${state ? "conectado" : email_usuario ? "desconectado" : ""}`}
      />
      <div className="chatinfo">
        {!chat.infoUsuario.nickName ? (
          <span>{n_usuario}</span>
        ) : (
          <span>{chat.infoUsuario.nickName}</span>
        )}
        <p>
          {chat.ultimoMens?.senderId === currentUser.uid &&
            "Tú: "}
          {chat.ultimoMens?.text}
        </p>
        <p className="hora">
          {chat.ultimoMens?.date?.seconds &&
            formatDateWithDay(chat.ultimoMens.date)}
        </p>
      </div>
    </div>
  );
};

export default Chats;