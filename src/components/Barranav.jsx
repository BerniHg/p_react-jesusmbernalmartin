import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import imgAjustes from "../img/ajustes.png";
import { doc, updateDoc } from "firebase/firestore";
import { baseDatos } from "../firebase";

const Barranav = () => {
  const { currentUser } = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
        connected: false
      });
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="barranav">
      <div className="usuario">
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
      </div>
      <div className="botones_opciones">
        <button onClick={handleSignOut}>Cerrar sesión</button>
        <Link to="/ajustes">
          <img src={imgAjustes} alt="" />
        </Link>
      </div>
    </div>
  );
};

export default Barranav;

