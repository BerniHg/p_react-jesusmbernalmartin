import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  signOut,
  updatePassword,
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { Link } from "react-router-dom";
import { updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { baseDatos, storage } from "../firebase";
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
  const [imagen, setNuevaFoto] = useState(null);
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

  const auth = getAuth();

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
    const obtenerDatos = async (uid) => {
      const usuarioDocRef = doc(baseDatos, "usuarios", uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        setNuevoNombre(usuarioData.displayName);
        setNuevaFoto(usuarioData.photoURL);
        setNuevoNombreCompleto(usuarioData.fullName);
        setDarkMode(usuarioData.dark);
      }
    };

    obtenerDatos(currentUser.uid);
  }, [currentUser.uid]);

  useEffect(() => {
    setDarkMode(currentUser.dark);
  }, [currentUser]);

  const handleChangeFoto = (event) => {
    const selectedFile = event.target.files[0];
    setNuevaFoto(URL.createObjectURL(selectedFile));
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
        const storageRef = ref(storage, `fotosPerfil/${nombreCompleto}`);
        const uploadTask = uploadBytesResumable(storageRef, imagen);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {},
            reject,
            () => {
              resolve();
            }
          );
        });
        
        const downloadURL = await getDownloadURL(
          uploadTask.snapshot.ref
        );

        await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          photoURL: downloadURL,
          displayName: nombre,
          fullName: nombreCompleto,
        });
        
        setEditar(false);
      } catch (error) {
        console.error("Error al guardar los cambios", error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmation = window.confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta?"
      );
      if (confirmation) {
        await deleteDoc(doc(baseDatos, "usuarios", currentUser.uid));
        await currentUser.delete();
        console.log("Cuenta eliminada exitosamente");
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

  const handleDarkModeChange = async (e) => {
    console.log(e.target.checked);
    setDarkMode(e.target.checked);
    updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
      dark: e.target.checked,
    });
  };

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (darkMode) {
      rootElement.classList.add("dark-mode");
    } else {
      rootElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
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

    window.addEventListener("beforeunload", disconnectUser);

    return () => {
      window.removeEventListener("beforeunload", disconnectUser);
    };
  }, [currentUser]);

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
      await reauthenticate(md5(contr));
      // Actualizar la contraseña
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
      <div className="ajustes-header">
        <Link to="/">Regresar</Link>
      </div>
      <h2>Ajustes de usuario</h2>
      <form onSubmit={handleSubmit}>
        <h3>Datos de usuario</h3>
        <div className="ajustes-section">
          <label htmlFor="nuevaFoto">
            <p>Foto:</p>
            {imagen && (
              <img
                src={imagen}
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
