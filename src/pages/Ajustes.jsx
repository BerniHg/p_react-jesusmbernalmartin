import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { baseDatos } from "../firebase";
import "../style.css";

const Ajustes = () => {
  const { currentUser } = useContext(AuthContext);
  const [nombreCompleto, setNuevoNombreCompleto] = useState("");
  const [imagen, setNuevaFoto] = useState(currentUser.photoURL);
  const [nombre, setNuevoNombre] = useState(currentUser.displayName);
  const [contrasenna, setNuevaContrasena] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const obtenerNombreUsuario = async () => {
      try {
        const usuarioSnapshot = await getDocs(collection(baseDatos, "usuarios", currentUser.uid));
        const usuarioData = usuarioSnapshot.docs.data();
        const nombre = usuarioData.fullName;

        setNuevoNombreCompleto(nombre);
        
      } catch (error) {
        console.error("Error al obtener los datos del usuario", error);
      }
    };

    obtenerNombreUsuario();
  }, [currentUser.uid]);

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

  const handleChangeContrasenna = (event) => {
    setNuevaContrasena(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      
      await baseDatos.collection("users").doc(currentUser.uid).update({
        photoURL: imagen,
        displayName: nombre,
        fullName: nombreCompleto,
      });

      console.log("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error al guardar los cambios", error);
    }
  };

  const handleDarkModeChange = (e) => {
    setDarkMode(e.target.checked);
  };

  useEffect(() => {
    const connectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: true,
        });
      } catch (error) {
        console.log("Error al actualizar el estado del usuario:", error);
      }
    };
  
    const disconnectUser = async () => {
      try {
        currentUser && await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
          connected: false,
        });
      } catch (error) {
        console.log("Error al desconectar al usuario:", error);
      }
    };
  
    connectUser();
  
    window.addEventListener("beforeunload", disconnectUser);
  
    return () => {
      window.removeEventListener("beforeunload", disconnectUser);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ajustes">
      <div className="ajustes-header">
        <Link to="/">Regresar</Link>
      </div>
      <h2>Ajustes de usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="ajustes-section">
          <label htmlFor="nuevaFoto">
            Foto:
            {imagen && <img src={imagen} alt="Imagen de perfil" />}
          </label>
          <input
            type="file"
            name="nuevaFoto"
            id="nuevaFoto"
            onChange={handleChangeFoto}
            accept="image/png,image/jpeg"
            style={{ display: "none" }}
          />
        </div>
        <div className="ajustes-section">
          <label htmlFor="nuevoNombreCompleto">Nombre completo:</label>
          <input
            type="text"
            name="nuevoNombreCompleto"
            id="nuevoNombreCompleto"
            value={nombreCompleto}
            onChange={handleChangeNombreCompleto}
          />
          <label htmlFor="nuevoNombre">Nombre:</label>
          <input
            type="text"
            name="nuevoNombre"
            id="nuevoNombre"
            value={nombre}
            onChange={handleChangeNombre}
          />
          <label htmlFor="nuevaContrasena">Contraseña:</label>
          <input
            type="password"
            name="nuevaContrasena"
            id="nuevaContrasena"
            onChange={handleChangeContrasenna}
            value={contrasenna}
          />
        </div>
        <input type="submit" value="Guardar cambios" className="submit-btn" />
      </form>
      <div className="ajustes-section">
        <h2>Modo oscuro:</h2>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeChange}
          />
          Activar modo oscuro
        </label>
      </div>
    </div>
  );
};

export default Ajustes;