import React, { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const [chats, setChats] = useState([]);

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

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (u) =>{
    dispatch({type: "CHANGE_USER", payload: u})
  }

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a, b)=>b[1].date - a[1].date).map((chat) => (
        <div className="chatusuario" key={chat[0]} onClick={()=>handleSelect(chat[1].infoUsuario)}>
          <img src={chat[1].infoUsuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{chat[1].infoUsuario.displayName}</span>
            <p>{chat[1].ultimoMens?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;