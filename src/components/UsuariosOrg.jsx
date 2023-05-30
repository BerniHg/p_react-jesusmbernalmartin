import { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { baseDatos } from "../firebase";
import PaginaCarga from "../components/PaginaCarga";
import { AuthContext } from "../context/AuthContext";

const UsuariosOrg = () => {
  const { currentUser } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(false);
  const [edicionUsuarios, setEdicionUsuarios] = useState({});
  const [datosEditados, setDatosEditados] = useState({});
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("fullName");
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina] = useState(5);
  const [mostrarUsuarios, setMostrarUsuarios] = useState("todos");
  const [rolUsuario, setRolUsuario] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSeleccionarFoto = (event) => {
    let foto = event.target.files[0];
    setFotoSeleccionada(foto);
  };

  const toggleEdicionUsuario = (uid) => {
    setEdicionUsuarios((prevEdicionUsuarios) => {
      const newEdicionUsuarios = { ...prevEdicionUsuarios };
      newEdicionUsuarios[uid] = !prevEdicionUsuarios[uid];
      return newEdicionUsuarios;
    });

    setFotoSeleccionada(false);

    if (!edicionUsuarios[uid]) {
      setDatosEditados((prevDatosEditados) => {
        const newDatosEditados = { ...prevDatosEditados };
        newDatosEditados[uid] = {
          fullName: usuarios.find((usuario) => usuario.uid === uid).fullName,
          displayName: usuarios.find((usuario) => usuario.uid === uid)
            .displayName,
          email: usuarios.find((usuario) => usuario.uid === uid).email,
          photoURL: usuarios.find((usuario) => usuario.uid === uid).photoURL,
        };
        return newDatosEditados;
      });
    }
  };

  const cancelarEdicionUsuario = (uid) => {
    setEdicionUsuarios((prevEdicionUsuarios) => {
      const newEdicionUsuarios = { ...prevEdicionUsuarios };
      newEdicionUsuarios[uid] = false;
      return newEdicionUsuarios;
    });

    setDatosEditados((prevDatosEditados) => {
      const newDatosEditados = { ...prevDatosEditados };
      newDatosEditados[uid] = {};
      return newDatosEditados;
    });
  };

  const handleBuscarUsuarios = (event) => {
    setTerminoBusqueda(event.target.value);
  };

  const handleOrdenarUsuarios = (criterio) => {
    if (criterio === criterioOrden) {
      setOrdenAscendente((prevOrdenAscendente) => !prevOrdenAscendente);
    } else {
      setCriterioOrden(criterio);
      setOrdenAscendente(true);
    }
  };

  const eliminarUsuario = async (uid) => {
    try {
      await deleteDoc(doc(baseDatos, "usuarios", uid));
      await deleteDoc(doc(baseDatos, "chatsUsuarios", uid));
      console.log("Usuario eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const confirmarEliminarUsuario = (uid) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de eliminar este usuario?"
    );

    if (confirmacion) {
      eliminarUsuario(uid);
    }
  };

  const obtenerRolUsuario = async (uid) => {
    try {
      const usuarioDocRef = doc(baseDatos, "usuarios", uid);
      const usuarioDocSnap = await getDoc(usuarioDocRef);
      if (usuarioDocSnap.exists()) {
        const usuarioData = usuarioDocSnap.data();
        const userRole = usuarioData.role;
        console.log(userRole);
        setRolUsuario(userRole);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerUsuariosPaginados = () => {
    const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
    const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;

    let usuariosFiltradosPaginados = usuariosOrdenados;

    if (mostrarUsuarios === "conectados") {
      usuariosFiltradosPaginados = usuariosFiltradosPaginados.filter(
        (usuario) => usuario.connected
      );
    } else if (mostrarUsuarios === "desconectados") {
      usuariosFiltradosPaginados = usuariosFiltradosPaginados.filter(
        (usuario) => !usuario.connected
      );
    }

    usuariosFiltradosPaginados = usuariosFiltradosPaginados.slice(
      indicePrimerUsuario,
      indiceUltimoUsuario
    );

    return usuariosFiltradosPaginados;
  };

  const usuariosFiltrados =
    usuarios.length > 0
      ? usuarios.filter(
          (usuario) =>
            (usuario.fullName &&
              usuario.fullName
                .toLowerCase()
                .includes(terminoBusqueda.toLowerCase())) ||
            (usuario.email &&
              usuario.email
                .toLowerCase()
                .includes(terminoBusqueda.toLowerCase()))
        )
      : [];

  const usuariosOrdenados = usuariosFiltrados.sort((a, b) => {
    const valorA = a[criterioOrden]?.toLowerCase() || "";
    const valorB = b[criterioOrden]?.toLowerCase() || "";
    if (valorA < valorB) return ordenAscendente ? -1 : 1;
    if (valorA > valorB) return ordenAscendente ? 1 : -1;
    return 0;
  });
  
  const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina);

  // Actualizar la lista de usuarios a mostrar cuando se cambie la página actual o la cantidad de usuarios por página
  const usuariosPaginados = obtenerUsuariosPaginados();

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual((prevPaginaActual) => prevPaginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    const ultimaPagina = Math.ceil(
      usuariosOrdenados.length / usuariosPorPagina
    );
    if (paginaActual < ultimaPagina) {
      setPaginaActual((prevPaginaActual) => prevPaginaActual + 1);
    }
  };

  const guardarCambiosUsuario = async (uid) => {
    toggleEdicionUsuario(uid);
    setCargando(true); // Activa la pantalla de carga

    try {
      await updateDoc(doc(baseDatos, "usuarios", uid), datosEditados[uid]);
      console.log("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }

    setCargando(false); // Desactiva la pantalla de carga
  };

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(baseDatos, "usuarios"));
      const usuariosData = usuariosSnapshot.docs.map((doc) => doc.data());
      setUsuarios(usuariosData);
    };

    obtenerUsuarios();

    if (currentUser) {
      obtenerRolUsuario(currentUser.uid);
    }
  }, [currentUser]);

  return (
    <div className="config">
      <div className="filtros">
        <select
          value={criterioOrden}
          onChange={(e) => handleOrdenarUsuarios(e.target.value)}
        >
          <option value="fullName">Nombre completo</option>
          <option value="displayName">Nombre</option>
          <option value="email">Email</option>
        </select>
        <button
          onClick={() =>
            setOrdenAscendente((prevOrdenAscendente) => !prevOrdenAscendente)
          }
        >
          {ordenAscendente ? "Ascendente" : "Descendente"}
        </button>
      </div>
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar usuarios"
          value={terminoBusqueda}
          onChange={handleBuscarUsuarios}
        />
        <select
          value={mostrarUsuarios}
          onChange={(e) => setMostrarUsuarios(e.target.value)}
        >
          <option value="todos">Mostrar todos</option>
          <option value="conectados">Mostrar conectados</option>
          <option value="desconectados">Mostrar desconectados</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rol</th>
            <th>Nombre completo</th>
            <th>Nombre</th>
            <th>Foto</th>
            <th>Email</th>
            <th colSpan={2}>Conectado</th>
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.map((usuario) =>
            usuario.displayName !== "ChatGPT" ? (
              <tr key={usuario.uid}>
                {cargando ? (
                  <td colSpan={6}>
                    <PaginaCarga />
                  </td>
                ) : edicionUsuarios[usuario.uid] ? (
                  <>
                    <td>
                      <select
                        name="rol"
                        id="rol"
                        value={usuario.role}
                        onChange={(e) =>
                          setDatosEditados((prevState) => ({
                            ...prevState,
                            [usuario.uid]: {
                              ...prevState[usuario.uid],
                              role: e.target.value,
                            },
                          }))
                        }
                      >
                        {rolUsuario === "chief" && (
                          <>
                            <option value="chief">Jefe</option>
                            <option value="admin">Admin</option>
                            <option value="user">Usuario</option>
                          </>
                        )}
                        {rolUsuario === "admin" && (
                          <>
                            <option value="admin">Admin</option>
                            <option value="user">Usuario</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={datosEditados[usuario.uid]?.fullName || ""}
                        onChange={(e) =>
                          setDatosEditados((prevState) => ({
                            ...prevState,
                            [usuario.uid]: {
                              ...prevState[usuario.uid],
                              fullName: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={datosEditados[usuario.uid]?.displayName || ""}
                        onChange={(e) =>
                          setDatosEditados((prevState) => ({
                            ...prevState,
                            [usuario.uid]: {
                              ...prevState[usuario.uid],
                              displayName: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        style={{ display: "none" }}
                        type="file"
                        id="archivo"
                        accept="image/png,image/jpeg"
                        onChange={handleSeleccionarFoto}
                      />
                      <label htmlFor="archivo">
                        <img
                          src={
                            fotoSeleccionada
                              ? URL.createObjectURL(fotoSeleccionada)
                              : usuario.photoURL
                          }
                          alt={usuario.displayName}
                          style={{ width: "100px", cursor: "pointer" }}
                        />
                      </label>
                    </td>
                    <td>{usuario.email}</td>
                    <td>{usuario.connected ? "Conectado" : "Desconectado"}</td>
                    <td className="botones">
                      <button
                        onClick={() => guardarCambiosUsuario(usuario.uid)}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => cancelarEdicionUsuario(usuario.uid)}
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {usuario.role === "chief" && <>Jefe</>}
                      {usuario.role === "admin" && <>Admin</>}
                      {usuario.role === "user" && <>Usuario</>}
                    </td>
                    <td>{usuario.fullName}</td>
                    <td>{usuario.displayName}</td>
                    <td>
                      <img
                        src={usuario.photoURL}
                        alt={usuario.displayName}
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>{usuario.email}</td>
                    <td>{usuario.connected ? "Conectado" : "Desconectado"}</td>
                    <td className="botones">
                      <button onClick={() => toggleEdicionUsuario(usuario.uid)}>
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarEliminarUsuario(usuario.uid)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ) : null
          )}
        </tbody>
      </table>
      <div className="paginacion">
        <button onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
          &lt; Anterior
        </button>
        <span>{paginaActual}</span>
        <button
          onClick={handlePaginaSiguiente}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente &gt;
        </button>
      </div>
    </div>
  );
};

export default UsuariosOrg;
