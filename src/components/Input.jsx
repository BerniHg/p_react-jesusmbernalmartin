import React from 'react'
import Annadir from "../img/attach.png"
import Imagen from "../img/annadir2.png"


const Input = () => {
  return (
    <div className='input'>
      <input type="text" placeholder="Escribe un mensaje..."/>
      <div className="enviar">
        <img src={Annadir} className="annadir" alt="" />
        <input type="file" style={{display:"none"}} id="archivo" />
        <label htmlFor="archivo">
          <img src={Imagen} alt="" />
        </label>
        <button>Enviar</button>
      </div>
    </div>
  )
}

export default Input