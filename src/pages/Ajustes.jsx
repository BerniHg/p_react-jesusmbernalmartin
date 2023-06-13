import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import PaginaCarga from "../components/PaginaCarga";
import { Link } from "react-router-dom";
import { updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { baseDatos, storage, auth } from "../firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import md5 from "md5";

const Ajustes = () => {
  const regexNombreCompleto =
    /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+){0,3}$/;
  const regexNombreUsuario = /^[a-zA-Z0-9_-]{4,16}$/;
  const regexContrasena =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_])[a-zA-Z\d-_]{8,}$/;

  const { currentUser } = useContext(AuthContext);
  const [nombreCompleto, setNuevoNombreCompleto] = useState("");
  const [imagen, setNuevaFoto] = useState({ file: null, localURL: "" });
  const [nombre, setNuevoNombre] = useState("");
  const [contr, setNuevaContr] = useState("");
  const [contrasenna, setNuevaContrasena] = useState("");
  const [confirmarContrasenna, setConfirmarContrasena] = useState("");
  const [darkMode, setDarkMode] = useState("");
  const [editar, setEditar] = useState(false);
  const [valoresOriginales, setValoresOriginales] = useState({
    nombreCompleto: nombreCompleto,
    imagen: imagen,
    nombre: nombre,
  });
  const [nombreCompletoError, setNombreCompletoError] = useState("");
  const [nombreUsuarioError, setNombreUsuarioError] = useState("");
  const [contrError, setContrError] = useState("");
  const [contrasenaError, setContrasenaError] = useState("");
  const [confirmarContrasenaError, setConfirmarContrasenaError] = useState("");
  const [mostrarContrasenna, setMostrarContrasenna] = useState(false);
  const [mostrarContrasenna1, setMostrarContrasenna1] = useState(false);
  const [mostrarContrasenna2, setMostrarContrasenna2] = useState(false);
  const [contrExito, setContrExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const reauthenticate = async (password) => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("Usuario vuelto a autenticar exitosamente");
    } catch (error) {
      setContrError("Contraña incorrecta.");
      console.error("Error al volver a autenticar al usuario", error);
    }
  };

  useEffect(() => {
    setCargando(true);
    const obtenerDatos = async (uid) => {
      const usuarioDocRef = doc(baseDatos, "usuarios", uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        setNuevoNombre(usuarioData.displayName);
        setNuevaFoto((prev) => ({
          ...prev,
          localURL: usuarioData.photoURL,
        }));
        setNuevoNombreCompleto(usuarioData.fullName);
        setDarkMode(usuarioData.dark);
      }
    };

    obtenerDatos(currentUser.uid);
    setCargando(false);
  }, [currentUser.uid]);

  useEffect(() => {
    setDarkMode(currentUser.dark);
  }, [currentUser]);

  const handleChangeFoto = (event) => {
    const selectedFile = event.target.files[0];
    console.log("selectedFile", selectedFile);
    setNuevaFoto({
      file: selectedFile,
      localURL: URL.createObjectURL(selectedFile),
    });
  };

  const handleChangeNombreCompleto = (event) => {
    setNuevoNombreCompleto(event.target.value);
  };

  const handleChangeNombre = (event) => {
    setNuevoNombre(event.target.value);
  };

  const handleChangeContr = (event) => {
    setNuevaContr(event.target.value);
  };

  const handleChangeContrasenna = (event) => {
    setNuevaContrasena(event.target.value);
  };

  const handleChangeConfirmarContrasenna = (event) => {
    setConfirmarContrasena(event.target.value);
  };

  const handleEditar = () => {
    setValoresOriginales({
      nombreCompleto,
      imagen,
      nombre,
    });
    setEditar(true);
  };

  const handleCancelar = () => {
    setNuevoNombreCompleto(valoresOriginales.nombreCompleto);
    setNuevaFoto(valoresOriginales.imagen);
    setNuevoNombre(valoresOriginales.nombre);
    setEditar(false);
    setNombreCompletoError("");
    setNombreUsuarioError("");
    setContrasenaError("");
    setConfirmarContrasenaError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCargando(true);
    let isValid = true;

    if (!regexNombreCompleto.test(nombreCompleto)) {
      setNombreCompletoError("El nombre completo no es válido");
      isValid = false;
    } else {
      setNombreCompletoError("");
    }

    if (!regexNombreUsuario.test(nombre)) {
      setNombreUsuarioError("El nombre de usuario no es válido");
      isValid = false;
    } else {
      setNombreUsuarioError("");
    }

    if (isValid) {
      try {
        if (imagen.file) {
          const storageRef = ref(storage, `fotosPerfil/${nombreCompleto}`);
          const uploadTask = uploadBytesResumable(storageRef, imagen.file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {},
            (error) => {
              console.error(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );

                await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
                  photoURL: downloadURL,
                  displayName: nombre,
                  fullName: nombreCompleto,
                });

                console.log("Cambios guardados exitosamente");
              } catch (error) {
                console.error(error);
              }
            }
          );
        } else {
          await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            displayName: nombre,
            fullName: nombreCompleto,
          });

          console.log("Cambios guardados exitosamente");
        }
      } catch (error) {
        console.error("Error al guardar los cambios", error);
      } finally {
        setEditar(false);
        setCargando(false);
      }
    }
  };
  /*
  const eliminarUsuario = async (uidUser, emailUser, passwordUser) => {
    try {
      console.log("Paso 1");

      await signInWithEmailAndPassword(auth, emailUser, passwordUser);

      console.log("Paso 2");

      await deleteUser(auth.currentUser, emailUser);

      await signInWithEmailAndPassword(auth, email, password);

      console.log("Paso 3");

      const usuarioDocRef = doc(baseDatos, "usuarios", uidUser);
      const usuarioDoc = await getDoc(usuarioDocRef);
      const usuarioData = usuarioDoc.data();

      if (usuarioData) {
        const usuarioDocRef_eliminados = doc(baseDatos, "usuariosEliminados", uidUser);

        await setDoc(usuarioDocRef_eliminados, {
          uid: usuarioData.uid,
          fullName: "Usuario No Encontrado",
          displayName: "Usuario No Encontrado",
          photoURL:
            "https://firebasestorage.googleapis.com/v0/b/orange-chat-14be2.appspot.com/o/usuario.jpg?alt=media&token=5905c705-9f69-4bb0-83d3-bce12c38fb37&_gl=1*1n7a7xe*_ga*NDU0NTQ2MjMyLjE2NzgxOTgxNjY.*_ga_CW55HF8NVT*MTY4NjU5NjY0NS45NS4xLjE2ODY1OTY3ODMuMC4wLjA."
        })
        
        await deleteDoc(usuarioDocRef);
      }

      console.log("Paso 4");

      await deleteDoc(doc(baseDatos, "chatsUsuarios", uidUser));

      console.log(
        "Correo electrónico de autenticación eliminado correctamente."
      );

      console.log("Usuario eliminado correctamente.");

      navigate("/admin");
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };
  */

  const handleDeleteAccount = async () => {
    try {
      const confirmation = window.confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta?"
      );
      if (confirmation) {
        await deleteUser(auth.currentUser, currentUser.email);

        const usuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid);
        const usuarioDoc = await getDoc(usuarioDocRef);
        const usuarioData = usuarioDoc.data();

        if (usuarioData) {
          const usuarioDocRef_eliminados = doc(
            baseDatos,
            "usuariosEliminados",
            currentUser.uid
          );

          await setDoc(usuarioDocRef_eliminados, {
            uid: currentUser.uid,
            fullName: "Usuario No Encontrado",
            displayName: "Usuario No Encontrado",
            photoURL:
              "https://firebasestorage.googleapis.com/v0/b/orange-chat-14be2.appspot.com/o/usuario.jpg?alt=media&token=5905c705-9f69-4bb0-83d3-bce12c38fb37&_gl=1*1n7a7xe*_ga*NDU0NTQ2MjMyLjE2NzgxOTgxNjY.*_ga_CW55HF8NVT*MTY4NjU5NjY0NS45NS4xLjE2ODY1OTY3ODMuMC4wLjA.",
          });

          await deleteDoc(usuarioDocRef);

          await signOut(auth);
        }
      }
    } catch (error) {
      console.error("Error al eliminar la cuenta", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
        connected: false,
      });
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  /*
  const handleDarkModeChange = async (e) => {
    console.log(e.target.checked);
    setDarkMode(e.target.checked);
    updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
      dark: e.target.checked,
    });
  };
  */

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (darkMode) {
      rootElement.classList.add("dark-mode");
    } else {
      rootElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    const habilitado = async () => {
      const usuarioDocRef = doc(baseDatos, "usuarios", currentUser.uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        console.log(usuarioData.enable);
        if (!usuarioData.enable) {
          await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: false,
          });
          signOut(auth);
        }
      }
    };

    const connectUser = async () => {
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: true,
          }));
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      }
    };

    const disconnectUser = async () => {
      try {
        currentUser &&
          (await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
            connected: false,
          }));
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };

    connectUser();
    habilitado();

    const interval = setInterval(habilitado, 5000);

    window.addEventListener("beforeunload", disconnectUser);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", disconnectUser);
    };
  });

  const handleChangePassword = async () => {
    let isValid = true;

    if (!regexContrasena.test(contrasenna)) {
      setContrasenaError("La contraseña no cumple los requisitos");
      isValid = false;
    } else {
      setContrasenaError("");
    }

    if (contrasenna !== confirmarContrasenna) {
      setConfirmarContrasenaError("Las contraseñas no coinciden");
      isValid = false;
    } else {
      setConfirmarContrasenaError("");
    }

    if (isValid) {
      setCargando(true);
      await reauthenticate(md5(contr));
      try {
        const hashedContrasenna = md5(contrasenna);
        await updatePassword(auth.currentUser, hashedContrasenna);

        await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          password: hashedContrasenna,
        });

        console.log("Contraseña actualizada exitosamente");
        setNuevaContr("");
        setNuevaContrasena("");
        setConfirmarContrasena("");
        setMostrarContrasenna(false);
        setMostrarContrasenna1(false);
        setMostrarContrasenna2(false);
        setContrExito(true);
      } catch (error) {
        console.error("Error al actualizar la contraseña", error);
        setContrExito(false);
      } finally {
        setCargando(false);
      }
    }
  };

  const handleTogglePassword = () => {
    setMostrarContrasenna(!mostrarContrasenna);
  };

  const handleTogglePassword1 = () => {
    setMostrarContrasenna1(!mostrarContrasenna1);
  };

  const handleTogglePassword2 = () => {
    setMostrarContrasenna2(!mostrarContrasenna2);
  };

  return (
    <div className="ajustes">
      {cargando && <PaginaCarga />}
      <div className="ajustes-header">
        <Link to="/">Regresar</Link>
      </div>
      <h2>Ajustes de usuario</h2>
      <form onSubmit={handleSubmit}>
        <h3>Datos de usuario</h3>
        <div className="ajustes-section">
          <label htmlFor="nuevaFoto">
            <p>Foto:</p>
            {imagen.localURL && (
              <img
                src={imagen.localURL}
                alt="Imagen de perfil"
                style={editar ? { cursor: "pointer" } : {}}
              />
            )}
          </label>
          <input
            type="file"
            name="nuevaFoto"
            id="nuevaFoto"
            onChange={handleChangeFoto}
            accept="image/png,image/jpeg"
            style={{ display: "none" }}
            disabled={!editar}
          />
        </div>
        <div className="ajustes-section">
          <label htmlFor="nuevoNombreCompleto .ajustes">Nombre completo:</label>
          <input
            type="text"
            name="nuevoNombreCompleto"
            id="nuevoNombreCompleto"
            value={nombreCompleto}
            onChange={handleChangeNombreCompleto}
            disabled={!editar}
          />
          {nombreCompletoError && (
            <p className="error-message">{nombreCompletoError}</p>
          )}
          <label htmlFor="nuevoNombre .ajustes">Nombre:</label>
          <input
            type="text"
            name="nuevoNombre"
            id="nuevoNombre"
            value={nombre}
            onChange={handleChangeNombre}
            disabled={!editar}
          />
          {nombreUsuarioError && (
            <p className="error-message">{nombreUsuarioError}</p>
          )}
          {editar && (
            <input
              type="submit"
              value="Guardar cambios"
              className="submit-btn"
            />
          )}
          {editar ? (
            <>
              <button onClick={handleCancelar} className="cancel-btn">
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleEditar} className="edit-btn">
              Editar
            </button>
          )}
        </div>
        <div className="ajustes-section">
          <h3>Cambiar contraseña</h3>
          <div className="form-group">
            <label htmlFor="contrasenna">Contraseña:</label>
            <div className="password-input">
              <input
                type={mostrarContrasenna ? "text" : "password"}
                value={contr}
                name="contrasenna"
                id="contrasenna"
                onChange={handleChangeContr}
              />
              <button type="button" onClick={handleTogglePassword}>
                {mostrarContrasenna ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {contrError && <p className="error-message">{contrError}</p>}
            <label htmlFor="nuevaContrasenna">Contraseña nueva:</label>
            <div className="password-input">
              <input
                type={mostrarContrasenna1 ? "text" : "password"}
                value={contrasenna}
                name="nuevaContrasenna"
                id="nuevaContrasenna"
                onChange={handleChangeContrasenna}
              />
              <button type="button" onClick={handleTogglePassword1}>
                {mostrarContrasenna1 ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {contrasenaError && (
              <p className="error-message">{contrasenaError}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmarContrasenna">Confirmar contraseña:</label>
            <div className="password-input">
              <input
                type={mostrarContrasenna2 ? "text" : "password"}
                value={confirmarContrasenna}
                onChange={handleChangeConfirmarContrasenna}
              />
              <button type="button" onClick={handleTogglePassword2}>
                {mostrarContrasenna2 ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {confirmarContrasenaError && (
              <p className="error-message">{confirmarContrasenaError}</p>
            )}
            {contrExito && (
              <p className="success-message">
                Contraseña cambiada exitosamente
              </p>
            )}
          </div>
          <button onClick={handleChangePassword} className="submit-btn">
            Cambiar contraseña
          </button>
        </div>
      </form>
      {/* 
      <div className="ajustes-section">
        <h3>Modo oscuro</h3>
        <label htmlFor="darkModeToggle" className="switch">
          <input
            type="checkbox"
            id="darkModeToggle"
            checked={darkMode}
            onChange={handleDarkModeChange}
          />
          <span className="slider round"></span>
        </label>
      </div>
      */}
      <div className="ajustes-section">
        <button onClick={handleSignOut} className="submit-btn">
          Cerrar sesión
        </button>
        <button onClick={handleDeleteAccount} className="submit-btn">
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
};

export default Ajustes;
