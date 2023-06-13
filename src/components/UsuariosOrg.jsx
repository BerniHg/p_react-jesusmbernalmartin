import { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
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
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [edicionUsuarios, setEdicionUsuarios] = useState({});
  const [proceso, setProceso] = useState(false);
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

  // Obtención de datos de usuarios
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

  // Seleccionar foto para usuario
  const handleSeleccionarFoto = (event) => {
    const foto = event.target.files[0];
    setFotoSeleccionada({
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

    if (!edicionUsuarios[uid]) {
      setProceso(true);
      setDatosEditados((prevDatosEditados) => {
        const newDatosEditados = { ...prevDatosEditados };
        newDatosEditados[uid] = {
          fullName: usuarios.find((usuario) => usuario.uid === uid).fullName, // Almacena el nombre completo del usuario con el UID correspondiente en el estado de datos editados
          displayName: usuarios.find((usuario) => usuario.uid === uid)
            .displayName, // Almacena el nombre de visualización del usuario con el UID correspondiente en el estado de datos editados
          email: usuarios.find((usuario) => usuario.uid === uid).email // Almacena el correo electrónico del usuario con el UID correspondiente en el estado de datos editados
        };

        return newDatosEditados;
      });
    }
  };

  // Devolver datos iniciales al usuario tras cancelar el cambio de los mismos
  const cancelarEdicionUsuario = (uid) => {
    setProceso(false);

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

  // Manejos de usuario
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

  // Inhabilitar usuario en caso de ser inhabilitado
  const inhabilitarUsuario = async (uidUser) => {
    try {
      const usuarioDocRef = doc(baseDatos, "usuarios", uidUser);
      const usuarioDoc = await getDoc(usuarioDocRef);
      const usuarioData = usuarioDoc.data();

      if (usuarioData) {
        await updateDoc(usuarioDocRef, {
          enable: false,
          connected: false,
        });
      }

      console.log("Usuario deshabilitado con éxito");

      window.location.reload();
    } catch (error) {
      console.error("Error al deshabilitar el usuario:", error);
    }
  };

  // Habilitar usuario en caso de ser habilitado
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

  // Eliminación de usuario
  const eliminarUsuario = async (uidUser, emailUser, passwordUser) => {
    try {

      await signInWithEmailAndPassword(auth, emailUser, passwordUser);

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

      await deleteDoc(doc(baseDatos, "chatsUsuarios", uidUser));

      await deleteUser(auth.currentUser, emailUser);

      window.location.reload();

      await signInWithEmailAndPassword(auth, email, password);

      navigate("/admin");

    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  //Confirmar acciones
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

  // Obtención y clasificación de usuarios
  const obtenerUsuariosPaginados = () => {
    const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
    const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;

    let usuariosFiltradosPaginados = usuariosOrdenados;

    console.log(usuariosFiltradosPaginados);
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

    return usuariosFiltradosPaginados;
  };

  // Control de usuarios enlistados
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

  const usuariosPaginados = obtenerUsuariosPaginados();
  const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina);

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

  // Guardar cambios del usuario
  const guardarCambiosUsuario = async (uid) => {
    toggleEdicionUsuario(uid);
  
    const nombreCompleto = datosEditados[uid]?.fullName || "";
    const nombreUsuario = datosEditados[uid]?.displayName || "";
  
    const nombreCompletoValido = regexNombreCompleto.test(nombreCompleto);
    const nombreUsuarioValido = regexNombreUsuario.test(nombreUsuario);
  
    if (!nombreCompletoValido || !nombreUsuarioValido) {
      alert("Uno de los campos no cumple su patrón");
      return;
    }
  
    try {
      setCargando(true);
      await updateDoc(doc(baseDatos, "usuarios", uid), datosEditados[uid]);
  
      console.log(fotoSeleccionada);
  
      if (fotoSeleccionada.file) {
        const storageRef = ref(
          storage,
          `fotosPerfil/${datosEditados[uid].fullName}`
        );
  
        const uploadTask = uploadBytesResumable(storageRef, fotoSeleccionada.file);
  
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
  
              console.log("Usuario actualizado correctamente.");
  
              // Espera 1 segundo antes de recargar la página
              await new Promise((resolve) => setTimeout(resolve, 1000));
              window.location.reload();
            } catch (error) {
              console.error(error);
            }
          }
        );
      } else {
        console.log("Usuario actualizado correctamente.");
  
        // Espera 1 segundo antes de recargar la página
        await new Promise((resolve) => setTimeout(resolve, 1000));
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
    setCargando(false);
  };  

  // Obtención de usuarios
  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosSnapshot = await getDocs(collection(baseDatos, "usuarios"));
      const usuariosData = usuariosSnapshot.docs
        .map((doc) => doc.data());
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

      await signInWithEmailAndPassword(auth, emailUser, passwordUser);

      await updatePassword(auth.currentUser, hashedContrasenna);

      await updateDoc(doc(baseDatos, "usuarios", uidUser), {
        password: hashedContrasenna,
        connected: false,
      });
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };

  return (
    <div className="config">
      {cargando && <PaginaCarga />}
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
                        value={datosEditados[usuario.uid]?.role || usuario.role}
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
                        src={fotoSeleccionada?.localURL || usuario.photoURL}
                        accept="image/png,image/jpeg"
                        onChange={handleSeleccionarFoto}
                      />
                      <label htmlFor="archivo">
                        <img
                          src={
                            fotoSeleccionada
                              ? fotoSeleccionada.localURL
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
                          disabled={proceso}
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
