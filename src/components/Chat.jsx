import React from 'react'
import Mensajes from "./Mensajes"
import Camara from "../img/camara.png"
import Annadir from "../img/annadir.png"
import Mas from "../img/mas.png"
import Input from "./Input"

const Chat = () => {
  return (
    <div className="chat">
      <div className="chatinfo">
        <span>Juan</span>
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