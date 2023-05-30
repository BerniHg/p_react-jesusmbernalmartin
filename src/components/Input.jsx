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
  const [img, setImg] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const apiChat = "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";
  const apiURL = "https://api.openai.com/v1/chat/completions";

  const handleKey = (envio) => {
    envio.code === "Enter" && handleSend();
  };

  const handleSend = async () => {
    console.log("Antes de verificar el contenido");
    if (!text && !img) {
      console.log("No hay texto ni imagen");
      return;
    }

    console.log("Después de verificar el contenido");

    if (img) {
      console.log("Subiendo imagen al almacenamiento");
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);

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

      console.log("URL de descarga de la imagen:", downloadURL);

      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
          img: downloadURL,
        }),
      });
    } else {
      console.log("No hay imagen, actualizando mensajes en Firestore");

      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    console.log("Actualizando información del usuario en Firestore");

    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId + ".ultimoMens"]: {
        text,
        senderId: currentUser.uid,
        date: Timestamp.now()
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    if(data.usuario.uid !== apiChat){
      await updateDoc(doc(baseDatos, "chatsUsuarios", data.usuario.uid), {
        [data.chatId + ".ultimoMens"]: {
          text,
          senderId: currentUser.uid,
          date: Timestamp.now()
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
    }
    

    setText("");
    setImg(null);

    console.log("Valor de data.usuario?.uid:", data.usuario?.uid);
    console.log("Valor de apiChat:", apiChat);

    if (data.usuario?.uid === apiChat) {
      console.log("Enviando solicitud a ChatGPT");
      try {
        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiChat}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: text },
            ],
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const message = responseData.choices[0].message.content.trim();

          console.log("Respuesta de ChatGPT:", responseData);

          console.log("Mensaje de ChatGPT:", message);

          await updateDoc(doc(baseDatos, "chats", data.chatId), {
            mensajes: arrayUnion({
              id: uuid(),
              text: message,
              senderId: apiChat,
              date: Timestamp.now(),
            }),
          });

          await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
            [data.chatId + ".ultimoMens"]: {
              text: message,
            },
            [data.chatId + ".date"]: serverTimestamp(),
          });
        } else {
          console.error("Error al enviar la solicitud a ChatGPT");
        }
      } catch (error) {
        console.error("Error al enviar la solicitud a ChatGPT:", error);
      }
    }
  };

  const isSendButtonDisabled = !text && !img;

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
              onChange={(contenido) => setImg(contenido.target.files[0])}
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
