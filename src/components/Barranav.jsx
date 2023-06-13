import React, { useContext, useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import imgAjustes from "../img/ajustes.png";
import imgAdmin from "../img/admin.png"
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";

const Barranav = () => {
  const { currentUser } = useContext(AuthContext);
  const [rolUsuario, setRolUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [foto, setFoto] = useState("");

  useEffect(() => {
    // Función para obtener el rol del usuario actual
    const obtenerRolUsuario = async (uid) => {
      try {
        // Obtener la referencia al documento del usuario en Firestore
        const usuarioDocRef = doc(baseDatos, "usuarios", uid);
        // Obtener los datos del documento del usuario
        const usuarioDocSnap = await getDoc(usuarioDocRef);
        if (usuarioDocSnap.exists()) {
          const usuarioData = usuarioDocSnap.data();
          const userRole = usuarioData.role;
          setNombre(usuarioData.displayName)
          setFoto(usuarioData.photoURL)
          console.log(userRole)
          setRolUsuario(userRole);
        }
      } catch (error) {
        console.log(error);
      }
    };

    console.log(currentUser)

    if (currentUser) {
      obtenerRolUsuario(currentUser.uid);
    }
  }, [currentUser]);

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      // Actualizar el campo "connected" del usuario en Firestore
      await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
        connected: false
      });
      // Cerrar sesión del usuario
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="barranav">
      <div className="usuario">
        <img src={foto} alt="" />
        <span>{nombre}</span>
      </div>
      <div className="botones_opciones">
        <button onClick={handleSignOut} className="logout">Cerrar sesión</button>
        <Link to="/ajustes">
          <img src={imgAjustes} alt="" />
        </Link>
        {rolUsuario !== "user" && <Link to="/admin">
          <img src={imgAdmin} alt="" />
        </Link>}
      </div>
    </div>
  );
};

export default Barranav;
