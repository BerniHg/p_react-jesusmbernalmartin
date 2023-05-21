import React, { useState } from "react";
import Foto from "../img/annadirFoto.png";
import UsuarioFoto from "../img/usuario.jpg";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, baseDatos, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Registro = () => {
  const [error, setError] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(false);

  const handleSeleccionarFoto = (event) => {
    let foto = event.target.files[0];
    setFotoSeleccionada(foto);
  };

  const handleEliminarFoto = () => {
    setFotoSeleccionada(null);
  };

  const navigate = useNavigate();

  const handleSubmit = async (valores) => {
    valores.preventDefault();
    console.log(valores.target[4].files[0]);
    const nombre_completo = valores.target[0].value;
    const nombre_usuario = valores.target[1].value;
    const correo = valores.target[2].value;
    const canal = `${nombre_usuario.toLowerCase().split().join("-")}-channel`;
    const contrasenna = valores.target[3].value;
    const foto = fotoSeleccionada || UsuarioFoto;
    console.log(nombre_completo, correo, contrasenna);

    try {
      const storageRef = ref(storage, nombre_completo);

      const uploadTask = uploadBytesResumable(storageRef, foto);

      uploadTask.on(
        (error) => {
          setError(true);
        },
        async () => {
          const datos = await createUserWithEmailAndPassword(
            auth,
            correo,
            contrasenna
          );

          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          console.log("url", downloadURL);

          console.log("aquí");

          await setDoc(doc(baseDatos, "usuarios", datos.user.uid), {
            uid: datos.user.uid,
            fullName: nombre_completo,
            displayName: nombre_usuario,
            email: correo,
            photoURL: downloadURL,
            channel: canal,
            connected: false,
          });

          console.log("aquí 2");

          await setDoc(doc(baseDatos, "chatsUsuarios", datos.user.uid), {});

          console.log("aquí 3");

          await updateProfile(datos.user, {
            displayName: nombre_usuario,
            photoURL: downloadURL,
          });

          let apiChat = "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";

          let idCombinado = "";

          if (datos.user.uid > apiChat) {
            idCombinado = datos.user.uid + apiChat;
          } else {
            idCombinado = apiChat + datos.user.uid;
          }

          const chatGPT = await getDoc(doc(baseDatos, "usuarios", apiChat));

          console.log("aquí 4");

          const datosChat = await getDoc(doc(baseDatos, "chats", idCombinado));

          if (!datosChat.exists()) {
            await setDoc(doc(baseDatos, "chats", idCombinado), {
              mensajes: [],
            });

            const infoUsuario = {
              uid: chatGPT.data().uid,
              displayName: chatGPT.data().displayName,
              photoURL: chatGPT.data().photoURL,
            };

            const datosUpdate = {
              [`${idCombinado}.infoUsuario`]: infoUsuario,
              [`${idCombinado}.fecha`]: serverTimestamp(),
            };

            await updateDoc(
              doc(baseDatos, "chatsUsuarios", datos.user.uid),
              datosUpdate
            );
          }

          console.log("aqui 5");

          navigate("/login");
        }
      );
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Orange Chat</span>
        <span className="titulo">Registro</span>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="nombre_completo"
            placeholder="Nombre completo"
          />
          <input
            type="text"
            id="nombre_usuario"
            placeholder="Nombre de usuario"
          />
          <input type="email" id="email" placeholder="Correo electrónico" />
          <input type="password" id="contrasenna" placeholder="Contraseña" />
          <input
            style={{ display: "none" }}
            type="file"
            id="archivo"
            accept="image/png,image/jpeg"
            onChange={handleSeleccionarFoto}
          />
          {fotoSeleccionada ? (
            <div className="fotoSeleccionadaContainer">
              <img
                className="fotoSeleccionada"
                src={URL.createObjectURL(fotoSeleccionada)}
                alt="Foto de perfil seleccionada"
              />
              <button
                type="button"
                className="cambiarFoto"
                onClick={() => document.getElementById("archivo").click()}
              >
                Cambiar
              </button>
              <button
                type="button"
                className="eliminarFoto"
                onClick={handleEliminarFoto}
              >
                Eliminar
              </button>
            </div>
          ) : (
            <label htmlFor="archivo">
              <div className="fotoContainer">
                <img
                  className="foto"
                  src={Foto}
                  alt="Añade una foto de perfil"
                />
                <span className="anadirFoto">Añade una foto de perfil</span>
              </div>
            </label>
          )}
          <button>Regístrate</button>
          {error && <span>Algo fue mal.</span>}
        </form>
        <p>
          ¿Ya tienes una cuenta creada? <Link to={"/login"}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
