import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { baseDatos } from "../firebase";

const Buscador = () => {
  const [nombreUsuario, setUsername] = useState("");
  const [usuario, setUser] = useState(null);
  const [error, errorProducido] = useState(false);

  const handleSearch = async () => {
    const busqueda = query(
      collection(baseDatos, "usuarios"),
      where("displayName", "==", nombreUsuario)
    );

    try {
      const querySnapshot = await getDocs(busqueda);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        setUser(doc.data());
      });
    } catch (error) {
      errorProducido(true);
    }
  };

  const handleKey = (valor) => {
    valor.code === "Enter" && handleSearch();
  };

  return (
    <div className="buscador">
      <div className="formulario">
        <input
          type="text"
          placeholder="Buscar usuario..."
          onKeyDown={handleKey}
          onChange={(valor) => setUsername(valor.target.value)}
        />
      </div>
      {error && <span>Usuario no encontrado</span>}
      {usuario && (
        <div className="chatusuario">
          <img src={usuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{usuario.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;
