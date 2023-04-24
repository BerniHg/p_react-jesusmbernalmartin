import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import Ajustes from "../img/ajustes.png"

const Barranav = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="barranav">
      <div className="usuario">
        <div className="nombre_imagen">
          <img src={currentUser.photoURL} alt="" />
          <span>{currentUser.displayName}</span>
        </div>
        <button onClick={() => signOut(auth)}>cerrar sesión</button>
        <img src={Ajustes} alt="" srcset="" />
      </div>
    </div>
  );
};

export default Barranav;
