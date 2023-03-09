import React, { useContext, useState } from "react";
import { collection, query, where, getDocs, setDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { baseDatos } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { updateDoc } from "firebase/firestore";

const Buscador = () => {
  const [nombreUsuario, setUsername] = useState("");
  const [usuario, setUser] = useState(null);
  const [error, errorProducido] = useState(false);
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
      errorProducido(true);
    }
  };

  const handleKey = (envio) => {
    envio.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    // busca si existe el chat en la base de datos
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
        // Crear chats en colección
        await setDoc(doc(baseDatos, "chats", idCombinado), {mensajes: [] })

        // crear chats de usuario
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
    }
    console.log(error)

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
      {usuario && (<div className="chatusuario" onClick={handleSelect}>
          <img src={usuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{usuario.displayName}</span>
          </div>
        </div>)}
    </div>
  );
};

export default Buscador;
