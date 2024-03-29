import { baseDatos } from "../firebase";
import React, { useContext, useState, useEffect, useRef } from "react";
import Mensajes from "./Mensajes";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc, deleteField, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import Puntos from "../img/puntos.png";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [nameClicked, setNameClicked] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [foto, setFoto] = useState("");
  const [email, setEmail] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [estructuraNombre, setEstructuraNombre] = useState("");
  const [connected, setConnected] = useState(false);
  const opcionesRef = useRef(null);

  // Función para manejar el clic del botón
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  // Función para manejar el clic del nombre
  const handleNameClicked = () => {
    setIsOpen(!isOpen);
    setNameClicked(!nameClicked);
  };

  // Función para eliminar un usuario
  const eliminarUsuario = async () => {
    const usuariosSnapshot = await getDocs(
      query(collection(baseDatos, "chatsUsuarios"), where(data.chatId + ".infoUsuario.uid", "==", data.usuario.uid))
    );

    if (!usuariosSnapshot.empty) {
      const doc = usuariosSnapshot.docs[0]; // Obtener el primer documento que cumple la condición
      const docRef = doc.ref;
      const chatId = data.chatId;
  
      // Eliminar la propiedad específica localmente
      const updateDataLocal = {
        [chatId + ".infoUsuario.uid"]: deleteField()
      };
      await updateDoc(docRef, updateDataLocal);
  
      // Eliminar el campo completo en Firebase Firestore
      await updateDoc(docRef, {
        [chatId]: deleteField()
      });
    }
  
    window.location.reload();
  };

  // Función para cambiar el nombre
  const cambiarNombre = async () => {
    if (nameClicked) {
      await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
        [data.chatId + ".infoUsuario.nickName"]: nuevoNombre,
      });
  
      if (nuevoNombre.trim() === "") {
        setNuevoNombre(data.usuario.displayName);
        setEstructuraNombre(data.usuario.displayName);
      } else {
        setEstructuraNombre(`${nuevoNombre} / ${data.usuario.displayName}`);
      }
      setNameClicked(!nameClicked);
    }
  };

  // Efecto que se ejecuta al cargar el componente o cuando cambian ciertas dependencias
  useEffect(() => {
    if (!data.usuario.nickName) {
      setNuevoNombre(nombreUsuario);
      setEstructuraNombre(nombreUsuario);
    } else {
      setNuevoNombre(data.usuario.nickName);
      setEstructuraNombre(`${data.usuario.nickName} / ${nombreUsuario}`);
    }

    // Función para obtener el nombre del usuario
    const nombreUser = async () => {
      try {
        const userDoc = await getDoc(
          doc(baseDatos, "usuarios", data.usuario.uid)
        );

        const userEliminatedDoc = await getDoc(
          doc(baseDatos, "usuariosEliminados", data.usuario.uid)
        );
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const nombre = userData.displayName;
          const foto_user = userData.photoURL;
          const email_user = userData.email;
          setNombreUsuario(nombre);
          setFoto(foto_user);
          setEmail(email_user);
        }
        else if (userEliminatedDoc) {
          const userData = userEliminatedDoc.data();
          const nombre = userData.displayName;
          const foto_user = userData.photoURL;
          const email_user = userData.email;
          setNombreUsuario(nombre);
          setFoto(foto_user);
          setEmail(email_user);
        }
      } catch (error) {
        console.error("Error al obtener el valor del nombre:", error);
      }
    };
  
    // Función para obtener el estado de conexión del usuario
    const fetchConnected = async () => {
      try {
        if(data.usuario.uid){
          const userDoc = await getDoc(
            doc(baseDatos, "usuarios", data.usuario.uid)
          );
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const connectedValue = userData.connected || false;
            setConnected(connectedValue);
          }
        }
      } catch (error) {
        console.error("Error al obtener el valor de connected:", error);
      }
    };
  
    nombreUser();
    fetchConnected();
  
    // Función para manejar el clic fuera del componente
    const handleClickOutside = (event) => {
      if (opcionesRef.current && !opcionesRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
  
    // Intervalo para actualizar el estado de conexión
    const interval = setInterval(fetchConnected, 1000);
  
    return () => {
      clearInterval(interval);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [currentUser.displayName, data.usuario.displayName, data.usuario.nickName, data.usuario.uid, nombreUsuario]);

  return (
    <div
      className="chat"
      style={data.chatId === "null" ? { display: "none" } : null}
    >
      <div className="chatinfo">
        <div className="chatusuario">
          <img
            className={`chatimagen ${
              connected
                ? "conectado"
                : email
                ? "desconectado"
                : ""
            }`}
            src={foto}
            alt={nombreUsuario}
          />

          {!nameClicked ? (
            <p className="chatnombre" id="usuario_nombre">
              {estructuraNombre}
            </p>
          ) : (
            <>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(event) => setNuevoNombre(event.target.value)}
                id="nuevoNombre" maxLength={20}
              />
              <input type="button" value="Cambiar" onClick={cambiarNombre} />
            </>
          )}
        </div>
        {data.usuario.displayName !== "ChatGPT" && (
          <div className="chatopciones" ref={opcionesRef}>
            <img
              className="ajustes"
              src={Puntos}
              alt=""
              onClick={handleButtonClick}
            />
            {isOpen && (
              <div className="opcionesmenu">
                <p onClick={eliminarUsuario}>Eliminar contacto</p>
                {email && <p onClick={handleNameClicked}>Cambiar nombre</p>}
              </div>
            )}
          </div>
        )}
      </div>
      <Mensajes />
      <Input />
    </div>
  );
};

export default Chat;