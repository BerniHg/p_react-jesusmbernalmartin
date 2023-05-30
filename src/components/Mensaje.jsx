import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { format, isToday, isYesterday } from 'date-fns';

const Mensaje = ({ mensaje }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
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
      return `${format(formattedDate, 'dd/MM/yyyy')} ${formattedHours}:${formattedMinutes}`;
    }
  }
  return (
    <div ref={ref} className={`mensaje ${mensaje.senderId === currentUser.uid ? 'duenno' : 'contacto'}`}>
      <div className="infomensaje">
        <img src={mensaje.senderId === currentUser.uid ? currentUser.photoURL : data.usuario.photoURL} alt="" />
      </div>
      <div className="contenidomensaje">
        {mensaje.text.trim() !== '' && <p>{mensaje.text}</p>}

        {mensaje.img && <img src={mensaje.img} alt="" />}
      </div>
      <div className="hora">
        <p>{formatDateWithDay(mensaje.date)}</p>
      </div>
    </div>
  );
};

export default Mensaje;