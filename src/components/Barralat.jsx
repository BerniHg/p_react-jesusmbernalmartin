import React from 'react'
import Barranav from "./Barranav"
import Buscador from "./Buscador"
import Chats from "./Chats"

const Barralat = () => {
  return (
    <div className='barralat'>
      <Barranav />
      <Buscador />
      <Chats />
    </div>
  )
}

export default Barralat