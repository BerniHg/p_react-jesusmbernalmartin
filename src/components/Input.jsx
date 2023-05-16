import React, {useContext, useState } from 'react'
import Annadir from "../img/attach.png"
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import { updateDoc, arrayUnion, Timestamp, doc, serverTimestamp } from 'firebase/firestore'
import { baseDatos, storage } from '../firebase'
import { v4 as uuid } from 'uuid'
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Input = () => {
  const [ text, setText] = useState("")
  const [ img, setImg ] = useState(null)

  const {currentUser} = useContext(AuthContext)
  const {data} = useContext(ChatContext)

  const handleKey = (envio) => {
    envio.code === "Enter" && handleSend();
  };

  const handleSend = async () => {
    if (!text && !img) {
      return;
    }

    if(img)
    {
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
  
      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
          img: downloadURL
        })
      })
    }
    else{
      await updateDoc(doc(baseDatos, "chats", data.chatId), {
        mensajes: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now()
        })})
    }
  
    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [data.chatId+".ultimoMens"]:{
        text
      },
      [data.chatId+".date"]: serverTimestamp()
    })
  
    await updateDoc(doc(baseDatos, "chatsUsuarios", data.usuario.uid), {
      [data.chatId+".ultimoMens"]:{
        text
      },
      [data.chatId+".date"]: serverTimestamp()
    })
  
    setText("")
    setImg(null)
  }  

  return (
    <div className='input'>
      <input type="text" placeholder="Escribe un mensaje..." onChange={contenido=>setText(contenido.target.value)} onKeyDown={handleKey} value={text} />
      <div className="enviar">
        <input type="file" style={{display:"none"}} id="archivo" onChange={contenido=>setImg(contenido.target.files[0])}/>
        <label htmlFor="archivo">
          <img src={Annadir} alt="" />
        </label>
        <button onClick={handleSend} disabled={!text && !img}>Enviar</button>
      </div>
    </div>
  )
}

export default Input;