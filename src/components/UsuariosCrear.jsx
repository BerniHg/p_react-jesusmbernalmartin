import React, { useState, useEffect, useContext, useCallback } from "react";
import Foto from "../img/annadirFoto.png";
import PaginaCarga from "../components/PaginaCarga";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, baseDatos, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  doc,
  setDoc,
  where,
  query,
  getDocs,
  getDoc,
  collection,
  updateDoc,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import md5 from "md5";

const regexNombreCompleto =
  /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+){0,3}$/;
const regexNombreUsuario = /^[a-zA-Z0-9_-]{4,16}$/;
const regexCorreoElectronico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexContrasena =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_])[a-zA-Z\d-_]{8,}$/;

const UsuariosCrear = () => {
  const { currentUser } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(false);
  const [errors, setErrors] = useState({});
  const [mostrarPaginaCarga, setMostrarPaginaCarga] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const obtenerDatos = async (uid) => {
      const usuarioDocRef = doc(baseDatos, "usuarios", uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        setPassword(usuarioData.password);
        setEmail(usuarioData.email);
      }
    };

    obtenerDatos(currentUser.uid);
  }, [currentUser.uid]);

  const obtenerRolUsuario = useCallback(async () => {
    try {
      const usuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        const userRole = usuarioData.role;
        return userRole;
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentUser.uid]);

  useEffect(() => {
    const obtenerRol = async () => {
      try {
        const userRole = await obtenerRolUsuario();
        setRolUsuario(userRole);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerRol();
  }, [obtenerRolUsuario]);

  const handleSeleccionarFoto = (event) => {
    let foto = event.target.files[0];
    setFotoSeleccionada(foto);
  };

  const handleEliminarFoto = () => {
    setFotoSeleccionada(null);
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formulario = event.target;
    const nombre_completo = formulario.nombre_completo.value;
    const nombre_usuario = formulario.nombre_usuario.value;
    const correo = formulario.email.value;
    const contrasenna = formulario.password.value;
    const foto =
      fotoSeleccionada;

    const errors = {};

    const nombreUsuarioSnapshot = await getDocs(
      query(
        collection(baseDatos, "usuarios"),
        where("displayName", "==", nombre_usuario)
      )
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
        setMostrarPaginaCarga(true);

        const datos = await createUserWithEmailAndPassword(
          auth,
          correo,
          md5(contrasenna)
        );

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
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              await setDoc(doc(baseDatos, "usuarios", datos.user.uid), {
                uid: datos.user.uid,
                fullName: nombre_completo,
                displayName: nombre_usuario,
                email: correo,
                photoURL: downloadURL,
                connected: false,
                role: formulario.rol.value,
                password: md5(contrasenna),
                enable: true,
              });

              await setDoc(doc(baseDatos, "chatsUsuarios", datos.user.uid), {});

              await updateProfile(datos.user, {
                displayName: nombre_usuario,
                photoURL: downloadURL,
              });

              await updateDoc(doc(baseDatos, "usuarios", datos.user.uid), {
                connected: false,
              });

              if(!fotoSeleccionada)
              {
                await updateDoc(doc(baseDatos, "usuarios", datos.user.uid), {
                  photoURL: "https://firebasestorage.googleapis.com/v0/b/orange-chat-14be2.appspot.com/o/usuario.jpg?alt=media&token=5905c705-9f69-4bb0-83d3-bce12c38fb37&_gl=1*1n7a7xe*_ga*NDU0NTQ2MjMyLjE2NzgxOTgxNjY.*_ga_CW55HF8NVT*MTY4NjU5NjY0NS45NS4xLjE2ODY1OTY3ODMuMC4wLjA.",
                });
              }

              navigate("/admin");
              await signInWithEmailAndPassword(auth, email, password);
              window.location.reload();
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
      } finally {
        setMostrarPaginaCarga(false);
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
          <form onSubmit={handleSubmit}>
            <select name="rol" id="rol">
              {rolUsuario === "chief" && <option value="chief">Jefe</option>}
              {(rolUsuario === "chief" || rolUsuario === "admin") && (
                <option value="admin">Admin</option>
              )}
              <option value="user" defaultValue>
                Usuario
              </option>
            </select>
            <input
              type="text"
              id="nombre_completo"
              placeholder="Nombre completo"
            />
            {errors.nombre_completo && (
              <span className="error">{errors.nombre_completo}</span>
            )}
            <span className="requisitos">Primer nombre / Segundo nombre y apellidos de forma opcional, hasta 3</span>
            <input
              type="text"
              id="nombre_usuario"
              placeholder="Nombre de usuario"
            />
            {errors.nombre_usuario && (
              <span className="error">{errors.nombre_usuario}</span>
            )}
            <span className="requisitos">Mínimo 4 y máximo 16 caracteres con mayúsculas, minúsculas, números, y guiones</span>
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
            <span className="requisitos">Mínimo 8 caracteres con mayúsculas, minúsculas, números, y guiones</span>
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
                  style={{
                    width: "90px",
                    height: "90px",
                    border: "2px solid #b0652d",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
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
                    src={Foto}
                    alt="Añadir foto"
                    className="foto"
                  />
                  <span className="anadirFoto">Añade una foto de perfil</span>
                </div>
              </label>
            )}

            {error && (
              <span className="error">
                Ha ocurrido un error. Inténtalo de nuevo más tarde.
              </span>
            )}
            <button className="boton" type="submit">
              Crear usuario
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UsuariosCrear;
