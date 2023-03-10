import React, { useContext, useState } from "react";
import { collection, query, where, getDocs, setDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { updateDoc } from "firebase/firestore";

const Buscador = () => {
  const [nombreUsuario, setUsername] = useState("");
  const [usuario, setUser] = useState(null);
  const [mostrarUsuario, setMostrarUsuario] = useState(true);
  const [error, setError] = useState(false);
  const {currentUser} = useContext(AuthContext)

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
      setError(true);
    }
  };

  const handleKey = (envio) => {
    envio.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    let idCombinado = "";
    
    if(currentUser.uid > usuario.uid)
    {
      idCombinado = currentUser.uid + usuario.uid;
    }
    else
    {
      idCombinado = usuario.uid + currentUser.uid;
    }

    try {
      const datos = await getDoc(doc(baseDatos, "chats", idCombinado))

      if(!datos.exists()){
        await setDoc(doc(baseDatos, "chats", idCombinado), {mensajes: [] })

        await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
          [idCombinado + ".infoUsuario"]: {
            uid: usuario.uid,
            displayName: usuario.displayName,
            photoURL: usuario.photoURL
          },
          [idCombinado + ".fecha"]: serverTimestamp()
        })

        await updateDoc(doc(baseDatos, "chatsUsuarios", usuario.uid), {
          [idCombinado + ".infoUsuario"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          },
          [idCombinado + ".fecha"]: serverTimestamp()
        })
      }
    }
    catch(error){
      setUser(null);
      setUsername("");
      setError(true);
    }
    
    setMostrarUsuario(false);
  }

  return (
    <div className="buscador">
      <div className="formulario">
        <input
          type="text"
          placeholder="Buscar usuario..."
          onKeyDown={handleKey}
          onChange={(envio) => setUsername(envio.target.value)}
          value={nombreUsuario}
        />
      </div>
      {error && <span>Usuario no encontrado</span>}
      {usuario && mostrarUsuario && (<div className="chatusuario" onClick={handleSelect}>
          <img src={usuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{usuario.displayName}</span>
          </div>
        </div>)}
    </div>
  );
};

export default Buscador;
