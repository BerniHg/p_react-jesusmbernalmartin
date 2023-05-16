import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Ajustes = () => {
  const { currentUser } = useContext(AuthContext);
  const [imagen, setNuevaFoto] = useState(currentUser.photoURL);
  const [nombre, setNuevoNombre] = useState(currentUser.displayName);
  const [contrasenna, setNuevaContrasena] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleChangeFoto = (event) => {
    const selectedFile = event.target.files[0];
    setNuevaFoto(URL.createObjectURL(selectedFile));
  };

  const handleChangeNombre = (event) => {
    setNuevoNombre(event.target.value);
  };

  const handleChangeContrasenna = (event) => {
    setNuevaContrasena(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleDarkModeChange = (e) => {
    setDarkMode(e.target.checked);
  };

  return (
    <div className="ajustes">
      <div>
        <Link to="/">Regresar</Link>
      </div>
      <div>
        <h2>Ajustes de usuario</h2>
        <form onSubmit={handleSubmit}>
          <div id="col_1">
            <label htmlFor="nuevaFoto">Foto:</label>
            <input
              type="file"
              name="nuevaFoto"
              id="nuevaFoto"
              onChange={handleChangeFoto}
              accept="image/png,image/jpeg"
            />
            {imagen && <img src={imagen} alt="Imagen de perfil" />}
          </div>
          <div id="col_2">
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
          <input type="submit" value="Guardar cambios" />
        </form>
      </div>
      <div>
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
