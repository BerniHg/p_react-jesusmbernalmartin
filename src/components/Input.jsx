import React, { useContext, useState } from "react";
import Annadir from "../img/attach.png";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import {
  updateDoc,
  arrayUnion,
  Timestamp,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { baseDatos, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Input = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const apiChat = "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";

  const handleKey = (envio) => {
    envio.code === "Enter" && handleSend();
  };

  const handleSend = async () => {
    if (!text && !file) {
      return;
    }

    if (file) {
      const storageRef = ref(storage, `${uuid()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => {},
          reject,
          () => {
            resolve();
          }
        );
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const mensajeData = {
        id: uuid(),
        senderId: currentUser.uid,
        date: Timestamp.now(),
      };

      if (file.type.startsWith("image/")) {
        mensajeData.img = downloadURL;
        mensajeData.fileName = file.name;
      } else {
        mensajeData.file = downloadURL;
        mensajeData.fileName = file.name;
      }

      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion(mensajeData),
      });
    } else {
      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId + ".ultimoMens"]: {
        text: text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(baseDatos, "chatsUsuarios", data.usuario.uid), {
      [data.chatId + ".ultimoMens"]: {
        text: text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setFile(null);
  };

  const isSendButtonDisabled = !text && !file;

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        onChange={(contenido) => setText(contenido.target.value)}
        onKeyDown={handleKey}
        value={text}
        id="mensaje"
      />
      <div className="enviar">
        {data.usuario?.uid !== apiChat ? (
          <>
            <input
              type="file"
              style={{ display: "none" }}
              id="archivo"
              accept="*"
              onChange={(contenido) => setFile(contenido.target.files[0])}
            />

            <label htmlFor="archivo">
              <img src={Annadir} alt="" />
            </label>
          </>
        ) : null}
        <button onClick={handleSend} disabled={isSendButtonDisabled}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Input;