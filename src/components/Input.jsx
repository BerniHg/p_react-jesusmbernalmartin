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
  const [isUploading, setIsUploading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  /*
  const apiChat = "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";
  const apiURL = "https://api.openai.com/v1/chat/completions";
  */

  // Maneja el evento de presionar una tecla
  const handleKey = (event) => {
    if (event.code === "Enter") {
      handleSend();
    }
  };

  // Maneja el envío del mensaje
  const handleSend = async () => {
    if (!text && !img) {
      return;
    }

    if (img) {
      const fileExtension = img.name.split(".").pop().toLowerCase();
      const imageExtensions = ["jpg", "jpeg", "png", "gif", ".svg"];

      if (imageExtensions.includes(fileExtension)) {
        const storageRef = ref(storage, `contenidoChat/${img.name}`);
        const uploadTask = uploadBytesResumable(storageRef, img);

        setIsUploading(true);

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

        await updateDoc(doc(baseDatos, "chats", data.chatId), {
          mensajes: arrayUnion({
            id: uuid(),
            text: text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });

        setIsUploading(false);
      } else {
        const storageRef = ref(storage, `contenidoChat/${img.name}`);
        const uploadTask = uploadBytesResumable(storageRef, img);

        setIsUploading(true);

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

        await updateDoc(doc(baseDatos, "chats", data.chatId), {
          mensajes: arrayUnion({
            id: uuid(),
            text: text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            file: downloadURL,
            fileName: img.name,
          }),
        });
        setIsUploading(false);
      }
    } else {

      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text: text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId + ".ultimoMens"]: {
        text: text || img.name,
        senderId: currentUser.uid,
        date: Timestamp.now(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    //if (data.usuario.uid !== apiChat) {
      await updateDoc(doc(baseDatos, "chatsUsuarios", data.usuario.uid), {
        [data.chatId + ".ultimoMens"]: {
          text: text || img.name,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
    //}

    setText("");
    setImg(null);

    /*
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
    */
  };

  // Maneja la cancelación de la selección de imagen
  const handleCancel = () => {
    setImg(null);
  };

  const isSendButtonDisabled = !text && !img;

  return (
    <>
      <div className="input">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKey}
          value={text}
          id="mensaje"
        />
        <div className="enviar">
          {img && !isUploading && (
            <button onClick={handleCancel}>Cancelar</button>
          )}

          {!img && (
            <>
              <input
                type="file"
                style={{ display: "none" }}
                id="archivo"
                onChange={(event) => setImg(event.target.files[0])}
              />
              <label htmlFor="archivo">
                <img src={Annadir} alt="" />
              </label>
            </>
          )}

          {isUploading ? (
            <p>Enviando...</p>
          ) : (
            <button onClick={handleSend} disabled={isSendButtonDisabled}>
              Enviar
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Input;
