import React from "react";
import Barranav from "./Barranav"
import Buscador from "./Buscador"
import Chats from "./Chats"

const Barralat = ({mostrarBarra}) => {
  return (
    <div className={`barralat ${mostrarBarra ? '' : 'barralat-oculto'}`}>
    <Barranav />
    <Buscador />
    <Chats />
  </div>
  )
}

export default Barralat