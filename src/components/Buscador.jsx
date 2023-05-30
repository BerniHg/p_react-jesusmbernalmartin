import { baseDatos } from "../firebase";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";

const Buscador = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarUsuario] = useState(true);
  const [error, setError] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(baseDatos, "usuarios"));
      const usuariosData = usuariosSnapshot.docs.map((doc) => doc.data());
      setUsuarios(usuariosData);
    };

    obtenerUsuarios();
  }, []);

  useEffect(() => {
    const filtrarUsuarios = () => {
      const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.displayName.toLowerCase().startsWith(nombreUsuario.toLowerCase())
      );
      setUsuariosFiltrados(usuariosFiltrados);
    };

    filtrarUsuarios();
  }, [nombreUsuario, usuarios]);

  const handleSelect = (usuarioSeleccionado) => {
    setUsuario(usuarioSeleccionado);
    setNombreUsuario(usuarioSeleccionado.displayName);
    setError(false);
  };

  return (
    <div className="buscador">
      <div className="formulario">
        <input
          type="text"
          placeholder="Buscar usuario..."
          onChange={(event) => setNombreUsuario(event.target.value)}
          value={nombreUsuario}
        />
      </div>
      {error && (
        <div className="chatusuario">
          <span>Usuario no encontrado</span>
        </div>
      )}
      {nombreUsuario &&
        usuariosFiltrados.map((usuario) => (
          <div
            key={usuario.id}
            className="chatusuario user"
            onClick={() => handleSelect(usuario)}
          >
            <img src={usuario.photoURL} alt="" />
            <div className="chatinfo">
              <span>{usuario.displayName}</span>
            </div>
          </div>
        ))}
      {usuario && mostrarUsuario && (
        <div className="chatusuario user">
          <img src={usuario.photoURL} alt="" />
          <div className="chatinfo">
            <span>{usuario.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;