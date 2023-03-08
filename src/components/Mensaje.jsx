import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Mensaje = ({mensaje}) => {
  const {currentUser} = useContext(AuthContext)
  const {data} = useContext(ChatContext)
  console.log(mensaje)
  return (
    <div className='duenno mensaje'>
      <div className="infomensaje">
        <img src="" alt="" />
        <span>Ahora mismo</span>
      </div>
      <div className="contenidomensaje">
        <p>Hola</p>
        <img src="https://espanol.wwe.com/f/styles/og_image/public/all/2016/07/John_Cena_bio--b51ea9d0b6f475af953923ac7791391b.jpg" alt="" />
      </div>
    </div>
  )
}

export default Mensaje