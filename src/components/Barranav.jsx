import React from 'react'
import Foto from "../img/usuario1.jpg"

const Barranav = () => {
  return (
    <div className='barranav'>
      <span className='logo'>Orange Chat</span>
      <div className='user'>
        <img src={Foto} alt="" />
        <span>John</span>
        <button>cerrar sesión</button>
      </div>
    </div>
  )
}

export default Barranav