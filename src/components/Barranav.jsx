import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

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
      </div>
    </div>
  );
};

export default Barranav;
