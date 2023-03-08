import React, {useContext, useEffect, useState} from 'react'
import Mensaje from "./Mensaje"
import { ChatContext } from '../context/ChatContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { baseDatos } from '../firebase'

const Mensajes = () => {
  const [mensajes, setMensajes] = useState([])
  const { data } = useContext(ChatContext)

  useEffect(()=>{
    const unSub = onSnapshot(doc(baseDatos, "chats", data.chatId), (doc)=>{
      doc.exists() && setMensajes(doc.data().mensajes)
    })

    return ()=>{
      unSub()
    }
  }, [data.chatId])

  return (
    <div className='mensajes'>
        {mensajes.map(m=>(
          <Mensaje mensaje={m} key={m.id} />
        ))}
    </div>
  )
}

export default Mensajes