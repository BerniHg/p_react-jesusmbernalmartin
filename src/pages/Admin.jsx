import React, { useState, useContext, useEffect } from "react";
import UsuariosOrg from "../components/UsuariosOrg";
import UsuariosCrear from "../components/UsuariosCrear";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";

const Admin = () => {
  const { currentUser } = useContext(AuthContext);
  const [seleccionado, setSeleccionado] = useState("usuariosOrg");

  const handleClick = (seccion) => {
    if (seleccionado === seccion) {
      setSeleccionado("");
    } else {
      setSeleccionado(seccion);
    }
  };

  useEffect(() => {
    const connectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: true,
        });
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      }
    };
  
    const disconnectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: false,
        });
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };
  
    connectUser();
  
    window.addEventListener("beforeunload", disconnectUser);
  
    return () => {
      window.removeEventListener("beforeunload", disconnectUser);
    };
  })

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