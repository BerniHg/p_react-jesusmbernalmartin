import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import imgAjustes from "../img/ajustes.png";

const Barranav = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="barranav">
      <div className="usuario">
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
      </div>
      <div className="botones_opciones">
        <button onClick={() => signOut(auth)}>cerrar sesión</button>
        <Link to="/ajustes">
          <img src={imgAjustes} alt=""  />
        </Link>
      </div>
    </div>
  );
};

export default Barranav;
