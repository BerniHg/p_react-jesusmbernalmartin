import { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { baseDatos, storage, auth } from "../firebase";
import PaginaCarga from "../components/PaginaCarga";
import { AuthContext } from "../context/AuthContext";
import {
  deleteUser,
  updatePassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref } from "firebase/storage";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import md5 from "md5";

const UsuariosOrg = () => {
  const { currentUser } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState("");
  const [foto, setFoto] = useState("");
  const [edicionUsuarios, setEdicionUsuarios] = useState({});
  const [datosEditados, setDatosEditados] = useState({});
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("role");
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina] = useState(5);
  const [mostrarUsuarios, setMostrarUsuarios] = useState("todos");
  const [rolUsuario, setRolUsuario] = useState("");
  const [cargando, setCargando] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rolFiltrado, setRolFiltrado] = useState("");
  const regexNombreCompleto =
    /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+){0,3}$/;
  const regexNombreUsuario = /^[a-zA-Z0-9_-]{4,16}$/;
  const regexContrasena =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_])[a-zA-Z\d-_]{8,}$/;

  const navigate = useNavigate();

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

  const handleSeleccionarFoto = (event) => {
    const foto = event.target.files[0];
    console.log("selectedFile", foto);
    setFotoSeleccionada(foto);
    setFoto({
      file: foto,
      localURL: URL.createObjectURL(foto),
    });
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

  const handleFiltrarPorRol = (event) => {
    setRolFiltrado(event.target.value);
  };

  const inhabilitarUsuario = async (uidUser) => {
    try {
      const usuarioDocRef = doc(baseDatos, "usuarios", uidUser);
      const usuarioDoc = await getDoc(usuarioDocRef);
      const usuarioData = usuarioDoc.data();

      if (usuarioData) {
        await updateDoc(usuarioDocRef, {
          enable: false,
        });
      }

      console.log("Usuario deshabilitado con éxito");

      window.location.reload();
    } catch (error) {
      console.error("Error al deshabilitar el usuario:", error);
    }
  };

  const habilitarUsuario = async (uidUser) => {
    try {
      const usuarioDocRef = doc(baseDatos, "usuarios", uidUser);
      const usuarioDoc = await getDoc(usuarioDocRef);
      const usuarioData = usuarioDoc.data();

      if (usuarioData) {
        await updateDoc(usuarioDocRef, {
          enable: true,
        });
      }

      console.log("Usuario habilitado con éxito");

      window.location.reload();
    } catch (error) {
      console.error("Error al habilitar el usuario:", error);
    }
  };

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
        await updateDoc(usuarioDocRef, {
          email: "",
          fullName: "Usuario No Encontrado",
          displayName: "Usuario No Encontrado",
          photoURL:
            "https://firebasestorage.googleapis.com/v0/b/orange-chat-14be2.appspot.com/o/fotosPerfil%2Fusuario.jpg?alt=media&token=b3fc218f-dfa4-415f-85f5-29caa9fa2ee8&_gl=1*4f1z6x*_ga*NDU0NTQ2MjMyLjE2NzgxOTgxNjY.*_ga_CW55HF8NVT*MTY4NjQ5NTI0Mi44OC4xLjE2ODY0OTUyNTUuMC4wLjA.",
          connected: null,
        });
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

  const confirmarEliminarUsuario = (uid, email, password) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de eliminar este usuario?"
    );

    if (confirmacion) {
      eliminarUsuario(uid, email, password);
    }
  };

  const confirmarInhabilitarUsuario = (uid) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres inhabilitar a este usuario?"
    );

    if (confirmacion) {
      inhabilitarUsuario(uid);
    }
  };

  const confirmarHabilitarUsuario = (uid) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres habilitar a este usuario?"
    );

    if (confirmacion) {
      habilitarUsuario(uid);
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
    console.log(usuariosOrdenados);

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

    if (rolFiltrado) {
      usuariosFiltradosPaginados = usuariosFiltradosPaginados.filter(
        (usuario) => usuario.role === rolFiltrado
      );
    }

    usuariosFiltradosPaginados = usuariosFiltradosPaginados.slice(
      indicePrimerUsuario,
      indiceUltimoUsuario
    );

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

  const usuariosOrdenados = usuariosFiltrados
    .filter((usuario) => usuario.email)
    .sort((a, b) => {
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

    const nombreCompleto = datosEditados[uid]?.fullName || "";
    const nombreUsuario = datosEditados[uid]?.displayName || "";

    const nombreCompletoValido = regexNombreCompleto.test(nombreCompleto);
    const nombreUsuarioValido = regexNombreUsuario.test(nombreUsuario);

    if (!nombreCompletoValido ||!nombreUsuarioValido) {
      alert("Uno de los campos no cumple su patrón");
      return;
    }

    try {
      setCargando(true);
      await updateDoc(doc(baseDatos, "usuarios", uid), datosEditados[uid]);
      const storageRef = ref(
        storage,
        `fotosPerfil/${datosEditados[uid].displayName}`
      );
      const uploadTask = uploadBytesResumable(storageRef, foto.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => console.error(error),
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await updateDoc(doc(baseDatos, "usuarios", currentUser.uid), {
              photoURL: downloadURL,
            });
          } catch (error) {
            console.error(error);
          }
        }
      );

      console.log("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
    window.location.reload();
    setCargando(false);
  };

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(baseDatos, "usuarios"));
      const usuariosData = usuariosSnapshot.docs
        .map((doc) => doc.data())
        .filter((usuario) => usuario.email !== !email);
      setUsuarios(usuariosData);
    };

    obtenerUsuarios();

    if (currentUser) {
      obtenerRolUsuario(currentUser.uid);
    }
  }, [currentUser, email]);

  const cambiarContrasenna = async (uidUser, emailUser, passwordUser) => {
    let contrasennaNueva = window.prompt("Contraseña nueva:");
    if (contrasennaNueva === null) {
      return;
    }
    while (!regexContrasena.test(contrasennaNueva)) {
      contrasennaNueva = window.prompt(
        "La contraseña no cumple con los requisitos, vuelve a escribirla:"
      );
      if (contrasennaNueva === null) {
        return;
      }
    }

    let contrasennaNuevaRepetir = window.prompt("Repite la contraseña:");
    if (contrasennaNuevaRepetir === null) {
      return;
    }
    while (contrasennaNueva !== contrasennaNuevaRepetir) {
      contrasennaNueva = window.prompt(
        "Las contraseñas no coincidieron, vuelve a escribirla:"
      );
      if (contrasennaNueva === null) {
        return;
      }
      while (!regexContrasena.test(contrasennaNueva)) {
        contrasennaNueva = window.prompt(
          "La contraseña no cumple con los requisitos, vuelve a escribirla:"
        );
        if (contrasennaNueva === null) {
          return;
        }
      }
      contrasennaNuevaRepetir = window.prompt("Repite la contraseña:");
      if (contrasennaNuevaRepetir === null) {
        return;
      }
    }

    try {
      const hashedContrasenna = md5(contrasennaNueva);
      console.log("Paso 1", emailUser, passwordUser);
      await signInWithEmailAndPassword(auth, emailUser, passwordUser);
      console.log("Paso 2");
      await updatePassword(auth.currentUser, hashedContrasenna);
      console.log("Paso 3");
      await updateDoc(doc(baseDatos, "usuarios", uidUser), {
        password: hashedContrasenna,
        connected: false,
      });
      console.log("Paso 4", auth);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };

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
        <select value={rolFiltrado} onChange={handleFiltrarPorRol}>
          <option value="">Mostrar todos</option>
          <option value="chief">Mostrar jefes</option>
          <option value="admin">Mostrar admins</option>
          <option value="user">Mostrar usuarios</option>
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
            usuario.email ? (
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
                        value={datosEditados[usuario.uid]?.role || ""}
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
                            <option
                              value="chief"
                              selected={usuario.role === "chief"}
                            >
                              Jefe
                            </option>
                            <option
                              value="admin"
                              selected={usuario.role === "admin"}
                            >
                              Admin
                            </option>
                            <option
                              value="user"
                              selected={usuario.role === "user"}
                            >
                              Usuario
                            </option>
                          </>
                        )}
                        {rolUsuario === "admin" && (
                          <>
                            <option
                              value="admin"
                              selected={usuario.role === "admin"}
                            >
                              Admin
                            </option>
                            <option
                              value="user"
                              selected={usuario.role === "user"}
                            >
                              Usuario
                            </option>
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
                        src={datosEditados[usuario.uid]?.photoURL || foto.URL}
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
                    {rolUsuario === "admin" && usuario.role === "chief" ? (
                      <td></td>
                    ) : (
                      <td className="botones">
                        <button
                          onClick={() => toggleEdicionUsuario(usuario.uid)}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            cambiarContrasenna(
                              usuario.uid,
                              usuario.email,
                              usuario.password
                            )
                          }
                        >
                          C. contraseña
                        </button>

                        {usuario.enable ? (
                          <button
                            onClick={() =>
                              confirmarInhabilitarUsuario(
                                usuario.uid,
                                usuario.email,
                                usuario.password
                              )
                            }
                          >
                            Inhabilitar
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              confirmarHabilitarUsuario(
                                usuario.uid,
                                usuario.email,
                                usuario.password
                              )
                            }
                          >
                            Habilitar
                          </button>
                        )}
                        <button
                          onClick={() =>
                            confirmarEliminarUsuario(
                              usuario.uid,
                              usuario.email,
                              usuario.password
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
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
