import React, {useContext} from 'react'
import Mensajes from "./Mensajes"
import Camara from "../img/camara.png"
import Annadir from "../img/annadir.png"
import Mas from "../img/mas.png"
import Input from "./Input"
import { ChatContext } from '../context/ChatContext'

const Chat = () => {
  const { data } = useContext(ChatContext)
  console.log(data)
  return (
    <div className="chat" style={data.chatId === "null" ? { display: "none" } : null}>
      <div className="chatinfo">
        <span>{data.usuario?.displayName}</span>
        <div className="chaticonos">
          <img src={Camara} alt="cámara" />
          <img src={Annadir} alt="añadir" />
          <img src={Mas} alt="más" />
        </div>
      </div>
      <Mensajes />
      <Input />
    </div>
  )
}

export default Chat