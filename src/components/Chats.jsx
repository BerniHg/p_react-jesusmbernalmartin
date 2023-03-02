import React from 'react'
import Foto1 from "../img/usuario2.jpg"

const Chats = () => {
  return (
    <div className='chats'>
      <div className="chatusuario">
        <img src={Foto1} />
        <div className="chatinfo">
          <span>Juan</span>
          <p>Hola</p>
        </div>
      </div>
    </div>
  )
}

export default Chats