import { baseDatos } from "../firebase";
import { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const Buscador = () => {
  const [nombreUsuario, setUsername] = useState("");
  const [usuario, setUser] = useState(null);
  const [mostrarUsuario, setMostrarUsuario] = useState(true);
  const [error, setError] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (nombreUsuario.trim() === "") {
        setUser(null);
        setError(false);
        return;
      }
      
      const busqueda = query(
        collection(baseDatos, "usuarios"),
        where("displayName", "==", nombreUsuario)
      );

      try {
        const querySnapshot = await getDocs(busqueda);
        if (querySnapshot.size === 0) {
          setUser(null);
          setError(true);
          setMostrarUsuario(true);
          return;
        }
        
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setError(false);
      } catch (error) {
        setUser(null);
        setError(true);
        setMostrarUsuario(true);
      }
    };
    fetchUser();
  }, [nombreUsuario]);

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
          onChange={(envio) => setUsername(envio.target.value)}
          value={nombreUsuario}
        />
      </div>
      {error && 
      <div className="chatusuario">
        <span>Usuario no encontrado</span>
      </div>}
      {usuario && mostrarUsuario && (<div className="chatusuario user" onClick={handleSelect}>
          <img src={usuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{usuario.displayName}</span>
          </div>
        </div>)}
    </div>
  );
};

export default Buscador;
