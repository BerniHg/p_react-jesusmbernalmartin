import React, { useState, useEffect } from "react";
import Foto from "../img/annadirFoto.png";
import PaginaCarga from "../components/PaginaCarga";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, baseDatos, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {
  doc,
  setDoc,
  where, query, getDocs, collection, updateDoc
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import md5 from "md5";


const regexNombreCompleto =
  /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+){0,3}$/;
const regexNombreUsuario = /^[a-zA-Z0-9_-]{4,16}$/;
const regexCorreoElectronico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexContrasena =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_])[a-zA-Z\d-_]{8,}$/;

const Registro = () => {
  const [error, setError] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(false);
  const [errors, setErrors] = useState({});
  const [mostrarPaginaCarga, setMostrarPaginaCarga] = useState(false);

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
    const nombre_completo = valores.target[0].value;
    const nombre_usuario = valores.target[1].value;
    const correo = valores.target[2].value;
    const contrasenna = valores.target[3].value;
    const foto = fotoSeleccionada;
  
    const errors = {};
  
    const nombreUsuarioSnapshot = await getDocs(
      query(collection(baseDatos, "usuarios"), where("displayName", "==", nombre_usuario))
    );
  
    if (!nombreUsuarioSnapshot.empty) {
      errors.nombre_usuario = "El nombre de usuario ya está en uso";
    }
  
    const correoSnapshot = await getDocs(
      query(collection(baseDatos, "usuarios"), where("email", "==", correo))
    );
  
    if (!correoSnapshot.empty) {
      errors.correo = "El correo electrónico ya está en uso";
    }
  
    if (!regexNombreCompleto.test(nombre_completo)) {
      errors.nombre_completo = "El nombre completo no es válido.";
    }
  
    if (!regexNombreUsuario.test(nombre_usuario)) {
      errors.nombre_usuario = "El nombre de usuario no es válido.";
    }
  
    if (!regexCorreoElectronico.test(correo)) {
      errors.correo = "El correo electrónico no es válido.";
    }
  
    if (!regexContrasena.test(contrasenna)) {
      errors.contrasenna = "La contraseña no es válida.";
    }
  
    setErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {
        const storageRef = ref(storage, `fotosPerfil/${nombre_usuario}`);
        const uploadTask = uploadBytesResumable(storageRef, foto);
  
        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            setError(true);
          },
          async () => {
            try {
              setMostrarPaginaCarga(true);
  
              const datos = await createUserWithEmailAndPassword(auth, correo, md5(contrasenna));
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  
              await setDoc(doc(baseDatos, "usuarios", datos.user.uid), {
                uid: datos.user.uid,
                fullName: nombre_completo,
                displayName: nombre_usuario,
                email: correo,
                photoURL: downloadURL,
                connected: false,
                role: "user",
                dark: false,
                password: md5(contrasenna),
                enable: true
              });
  
              await setDoc(doc(baseDatos, "chatsUsuarios", datos.user.uid), {});
  
              await updateProfile(datos.user, {
                displayName: nombre_usuario,
                photoURL: downloadURL,
              });

              if(!fotoSeleccionada)
              {
                await updateDoc(doc(baseDatos, "usuarios", datos.user.uid), {
                  photoURL: "https://firebasestorage.googleapis.com/v0/b/orange-chat-14be2.appspot.com/o/fotosPerfil%2Fusuario.jpg?alt=media&token=b3fc218f-dfa4-415f-85f5-29caa9fa2ee8&_gl=1*4f1z6x*_ga*NDU0NTQ2MjMyLjE2NzgxOTgxNjY.*_ga_CW55HF8NVT*MTY4NjQ5NTI0Mi44OC4xLjE2ODY0OTUyNTUuMC4wLjA.",
                });
              }
  
              navigate("/login");
            } catch (error) {
              console.log(error);
              setError(true);
            } finally {
              setMostrarPaginaCarga(false);
            }
          }
        );
      } catch (error) {
        console.log(error);
        setError(true);
      }
    }
  };

  useEffect(() => {
    const togglePasswordButton = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    const handleTogglePassword = () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordButton.textContent = "Ocultar";
      } else {
        passwordInput.type = "password";
        togglePasswordButton.textContent = "Mostrar";
      }
    };

    togglePasswordButton.addEventListener("click", handleTogglePassword);

    return () => {
      togglePasswordButton.removeEventListener("click", handleTogglePassword);
    };
  }, []);
  

  return (
    <div className="formContainer">
      {mostrarPaginaCarga ? (
        <PaginaCarga />
      ) : (
        <div className="formWrapper">
          <span className="logo">Orange Chat</span>
          <span className="titulo">Registro</span>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="nombre_completo"
              placeholder="Nombre completo"
            />
            {errors.nombre_completo && (
              <span className="error">{errors.nombre_completo}</span>
            )}
            <input
              type="text"
              id="nombre_usuario"
              placeholder="Nombre de usuario"
            />
            {errors.nombre_usuario && (
              <span className="error">{errors.nombre_usuario}</span>
            )}
            <input type="email" id="email" placeholder="Correo electrónico" />
            {errors.correo && <span className="error">{errors.correo}</span>}
            <div className="input-password-container">
            <input type="password" placeholder="Contraseña" id="password" />
            <button type="button" id="togglePassword">
              Mostrar
            </button>
            </div>
            {errors.contrasenna && (
              <span className="error">{errors.contrasenna}</span>
            )}
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
                  alt="Foto de perfil seleccionada" style={{"width": "90px",
                    "height": "90px",
                    "border": "2px solid #b0652d",
                    "border-radius": "50%",
                    "object-fit": "cover"}}
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
                  <img src={Foto} alt="Añadir foto" className="foto" />
                  <span className="anadirFoto">Añade una foto de perfil</span>
                </div>
              </label>
            )}
            <button type="submit" className="boton">
              Registrarse
            </button>
            {error && (
              <span className="error">
                Ha ocurrido un error durante el registro. Por favor, inténtelo
                nuevamente.
              </span>
            )}
            <p>
              ¿Ya tienes una cuenta creada?{" "}
              <Link to={"/login"}>Inicia sesión</Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Registro;
