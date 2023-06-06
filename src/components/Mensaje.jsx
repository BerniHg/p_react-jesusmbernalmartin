import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { format, isToday, isYesterday } from "date-fns";

const Mensaje = ({ mensaje }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [mensaje]);

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

  const handleImagenClick = (imagen) => {
    setImagenAmpliada(imagen);
  };

  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
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
              ? currentUser.photoURL
              : data.usuario.photoURL
          }
          alt=""
        />
      </div>
      <div className="contenidomensaje">
        <p>
          {mensaje.img ? (
            <div
              className="imagen-contenedor"
              onClick={() => handleImagenClick(mensaje.img)}
            >
              <img src={mensaje.img} alt="" />
            </div>
          ) : mensaje.file ? (
            <div className="archivo-contenedor">
              <p
                className="nombre-archivo"
                onClick={() => handleFileDownload(mensaje.file)} style={{cursor: "pointer"}}
              >
                {mensaje.fileName}
              </p>
            </div>
          ) : null}

          {mensaje.text.trim() !== "" && mensaje.text}
        </p>
      </div>
      <div className="hora">
        <p>{formatDateWithDay(mensaje.date)}</p>
      </div>

      {imagenAmpliada && (
        <div className="imagen-ampliada">
          <img src={imagenAmpliada} alt="Imagen ampliada" />
          <button onClick={() => setImagenAmpliada(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default Mensaje;
