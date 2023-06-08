import { baseDatos } from "../firebase";
import { useState, useEffect, useContext } from "react";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const Buscador = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [mostrarUsuario, setMostrarUsuario] = useState(false);
  const [error, setError] = useState(false);
  const { currentUser } = useContext(AuthContext);
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
      setMostrarUsuario(false);
      setError(false);

      if (nombreUsuario.trim() !== "" && usuariosFiltrados.length === 0) {
        setError(true);
      }
    };

    filtrarUsuarios();
  }, [nombreUsuario, usuarios]);

  const handleSelect = async (usuarioSeleccionado) => {
    let idCombinado = "";

    if (currentUser.uid > usuarioSeleccionado.uid) {
      idCombinado = currentUser.uid + usuarioSeleccionado.uid;
    } else {
      idCombinado = usuarioSeleccionado.uid + currentUser.uid;
    }

    try {
      const datos = await getDoc(doc(baseDatos, "chats", idCombinado));

      if (!datos.exists()) {
        await setDoc(doc(baseDatos, "chats", idCombinado), { mensajes: [] });

        await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
          [idCombinado + ".infoUsuario"]: {
            uid: usuarioSeleccionado.uid,
            displayName: usuarioSeleccionado.displayName,
            photoURL: usuarioSeleccionado.photoURL,
          },
          [idCombinado + ".fecha"]: serverTimestamp(),
        });

        await updateDoc(doc(baseDatos, "chatsUsuarios", usuarioSeleccionado.uid), {
          [idCombinado + ".infoUsuario"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [idCombinado + ".fecha"]: serverTimestamp(),
        });
      }
    } catch (error) {
      setNombreUsuario("");
      setError(true);
    }

    setMostrarUsuario(false);
    setNombreUsuario("");
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
        !error &&
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
      {mostrarUsuario && currentUser && (
        <div className="chatusuario user" onClick={() => handleSelect(currentUser)}>
          <img src={currentUser.photoURL} alt="" />
          <div className="chatinfo">
            <span>{currentUser.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buscador;
