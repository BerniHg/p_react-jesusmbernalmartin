import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { format, isToday, isYesterday } from "date-fns";
import { baseDatos } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Mensaje = ({ mensaje }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [fotoCurrent, setFotoCurrent] = useState(null);
  const [fotoUsuario, setFotoUsuario] = useState(null);

  useEffect(() => {
    // Scroll hacia abajo
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [mensaje]);

  useEffect(() => {
    const obtenerFoto = async () => {
      // Obtener la foto del usuario actual
      const currentUsuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid);
      const currentUsuarioDocSnap = await getDoc(currentUsuarioDocRef);
      if (currentUsuarioDocSnap.exists()) {
        const usuarioData = currentUsuarioDocSnap.data();
        setFotoCurrent(usuarioData.photoURL);
      }

      // Obtener la foto del usuario del chat
      const usuarioDocRef = doc(baseDatos, "usuarios", data.usuario.uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        setFotoUsuario(usuarioData.photoURL)
      }
    };

    obtenerFoto();
  }, [currentUser.uid, data.usuario.uid]);

  // Formato fechas
  function formatDateWithDay(date) {
    const formattedDate = new Date(date.seconds * 1000);
    const hours = formattedDate.getHours();
    const minutes = formattedDate.getMinutes();

    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    if (isToday(formattedDate)) {
      return `Hoy ${formattedHours}:${formattedMinutes}`;
    } else if (isYesterday(formattedDate)) {
      return `Ayer ${formattedHours}:${formattedMinutes}`;
    } else {
      return `${format(
        formattedDate,
        "dd/MM/yyyy"
      )} ${formattedHours}:${formattedMinutes}`;
    }
  }

  // Click en imagen
  const handleImagenClick = (imagen) => {
    setImagenAmpliada(imagen);
  };

  // Descarga de archivo
  const handleFileDownload = (fileURL, fileName) => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <div
      ref={ref}
      className={`mensaje ${
        mensaje.senderId === currentUser.uid ? "duenno" : "contacto"
      }`}
    >
      <div className="infomensaje">
        <img
          src={
            mensaje.senderId === currentUser.uid
              ? fotoCurrent : fotoUsuario
          }
          alt=""
        />
      </div>
      <div className="contenidomensaje">
        <p>
          {mensaje.img && (
            <div
              className="imagen-contenedor"
              onClick={() => handleImagenClick(mensaje.img)}
            >
              <img src={mensaje.img} alt="" />
            </div>
          )}
          {mensaje.file && (
            <div className="archivo-contenedor">
              <p
                className="nombre-archivo"
                onClick={() =>
                  handleFileDownload(mensaje.file, mensaje.fileName)
                }
                style={{ cursor: "pointer" }}
              >
                {mensaje.fileName}
              </p>
            </div>
          )}
          {mensaje.text.trim() !== "" && <span>{mensaje.text}</span>}
        </p>
      </div>
      <div className="hora">
        <p>{formatDateWithDay(mensaje.date)}</p>
      </div>

      {imagenAmpliada && (
        <div className="imagen-ampliada">
          <img src={imagenAmpliada} alt="Imagen ampliada" />
          <button onClick={() => setImagenAmpliada(null)} className="cerrar">
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default Mensaje;