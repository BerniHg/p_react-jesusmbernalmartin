import React, { useState } from "react";
import Foto from "../img/annadirFoto.png";
import UsuarioFoto from "../img/usuario.jpg";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, baseDatos, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Registro = () => {
  const [error, setError] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

  const handleSeleccionarFoto = (event) => {
    const foto = event.target.files[0];
    setFotoSeleccionada(URL.createObjectURL(foto));
  };

  const handleCambiarFoto = () => {
    setFotoSeleccionada(null);
  };

  const navigate = useNavigate()

  const handleSubmit = async (valores) => {
    valores.preventDefault();
    console.log(valores.target[3].files[0])
    const nombre = valores.target[0].value; 
    const correo = valores.target[1].value;
    const canal = `${((nombre.toLowerCase()).split()).join('-')}-channel`;
    const contrasenna = valores.target[2].value;
    const foto = fotoSeleccionada ? fotoSeleccionada : UsuarioFoto;
    console.log(nombre, correo, contrasenna);

    try {

      const storageRef = ref(storage, nombre);

      const uploadTask = uploadBytesResumable(storageRef, foto);

      uploadTask.on(
        (error) => {
          setError(true);
        },
        async () => {
          const datos = await createUserWithEmailAndPassword(auth, correo, contrasenna);
          
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          console.log('url', downloadURL)

          console.log('aquí');
          
          await setDoc(doc(baseDatos, "usuarios", datos.user.uid), {
            uid: datos.user.uid, displayName: nombre, email: correo, photoURL: downloadURL, channel: canal
          });

          console.log('aquí 2');

          await setDoc(doc(baseDatos, "chatsUsuarios", datos.user.uid), {});

          console.log('aquí 3');

          await updateProfile(datos.user, {
            displayName: nombre, photoURL: downloadURL 
          });

          navigate("/login");
        }
      );
    } catch (error) {
      console.log(error)
      setError(true);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Orange Chat</span>
        <span className="titulo">Registro</span>
        <form onSubmit={handleSubmit}>
          <input type="text" id="nombre" placeholder="Nombre de usuario" />
          <input type="email" id="email" placeholder="Correo electrónico" />
          <input type="password" id="contrasenna" placeholder="Contraseña" />
          <input
            style={{ display: "none" }}
            type="file"
            id="archivo"
            accept="image/png,image/jpeg"
            onChange={handleSeleccionarFoto}
          />
          <label htmlFor="archivo">
            {fotoSeleccionada ? (
              <div className="fotoSeleccionadaContainer">
                <img className="fotoSeleccionada" src={fotoSeleccionada} alt="Foto de perfil seleccionada" />
                <button type="button" className="cambiarFoto" onClick={handleCambiarFoto}>
                  Cambiar foto
                </button>
              </div>
            ) : (
              <div className="fotoContainer">
                <img className="foto" src={Foto} alt="Añade una foto de perfil" />
                <span className="anadirFoto">Añade una foto de perfil</span>
              </div>
            )}
          </label>
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