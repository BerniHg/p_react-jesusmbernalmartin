import React, { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Mensaje = ({mensaje}) => {
  const {currentUser} = useContext(AuthContext)
  const {data} = useContext(ChatContext)

  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth'
      })
    }
  }, [mensaje])

  return (
    <div ref={ref} className={`mensaje ${mensaje.senderId === currentUser.uid && "duenno"}`}>
      <div className="infomensaje">
        <img src={mensaje.senderId === currentUser.uid ? currentUser.photoURL : data.usuario.photoURL} alt="" />
      </div>
      <div className="contenidomensaje">
        <p>{mensaje.text}</p>
        {mensaje.img && <img src={mensaje.img} alt="" />}
      </div>
    </div>
  )
}

export default Mensaje;