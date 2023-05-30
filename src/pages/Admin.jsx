import React, { useState } from "react";
import UsuariosOrg from "../components/UsuariosOrg";
import UsuariosCrear from "../components/UsuariosCrear";

const Admin = () => {
  const [seleccionado, setSeleccionado] = useState("usuariosOrg");

  const handleClick = (seccion) => {
    if (seleccionado === seccion) {
      setSeleccionado("");
    } else {
      setSeleccionado(seccion);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-buttons">
      <button
        onClick={() => handleClick("usuariosOrg")}
        disabled={seleccionado === "usuariosOrg"}
      >
        Organizar usuarios
      </button>
      <button
        onClick={() => handleClick("usuariosCrear")}
        disabled={seleccionado === "usuariosCrear"}
      >
        Crear usuarios
      </button>
      </div>
      <div className="admin-content">
      {seleccionado === "usuariosOrg" && <UsuariosOrg />}
      {seleccionado === "usuariosCrear" && <UsuariosCrear />} 
      </div>
      
    </div>
  );
};

export default Admin;