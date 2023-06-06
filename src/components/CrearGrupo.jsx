import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { baseDatos } from "../firebase";

const CrearGrupo = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const obtenerUsuariosDisponibles = async () => {
    const usuariosSnapshot = await getDocs(
      query(
        collection(baseDatos, "chatsUsuarios"),
        where("usuario.uid", "!=", currentUser.uid)
      )
    );

    const usuarios = usuariosSnapshot.docs.map((doc) => doc.data().usuario);
    setUsuariosDisponibles(usuarios);
  };

  const handleMostrarFormulario = () => {
    obtenerUsuariosDisponibles();
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setNombreGrupo("");
    setUsuariosSeleccionados([]);
  };

  const handleCrearGrupo = async () => {
    if (nombreGrupo.trim() === "") {
      return;
    }

    if (usuariosSeleccionados.length === 0) {
      return;
    }

    const grupo = {
      nombre: nombreGrupo,
      miembros: [currentUser.uid, ...usuariosSeleccionados.map((u) => u.uid)],
    };

    const grupoRef = await addDoc(collection(baseDatos, "grupos"), grupo);

    const grupoId = grupoRef.id;

    const grupoChat = {
      nombre: nombreGrupo,
      miembros: [...usuariosSeleccionados, currentUser],
      grupoId: grupoId,
    };

    await setDoc(doc(baseDatos, "chats", grupoId), { mensajes: [] });

    await usuariosSeleccionados.forEach(async (usuario) => {
      await updateDoc(doc(baseDatos, "chatsUsuarios", usuario.uid), {
        [grupoId]: grupoChat,
      });
    });

    await updateDoc(doc(baseDatos, "chatsUsuarios", currentUser.uid), {
      [grupoId]: grupoChat,
    });

    setMostrarFormulario(false);
    setNombreGrupo("");
    setUsuariosSeleccionados([]);
  };

  return (
    <div>
      {!mostrarFormulario ? (
        <button onClick={handleMostrarFormulario}>Crear Grupo</button>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={nombreGrupo}
            onChange={(event) => setNombreGrupo(event.target.value)}
          />

          <select
            multiple
            value={usuariosSeleccionados.map((u) => u.uid)}
            onChange={(event) => {
              const opciones = event.target.options;
              const nuevosUsuariosSeleccionados = [];

              for (let i = 0; i < opciones.length; i++) {
                if (opciones[i].selected) {
                  nuevosUsuariosSeleccionados.push(
                    usuariosDisponibles.find((u) => u.uid === opciones[i].value)
                  );
                }
              }

              setUsuariosSeleccionados(nuevosUsuariosSeleccionados);
            }}
          >
            {usuariosDisponibles.map((usuario) => (
              <option key={usuario.uid} value={usuario.uid}>
                {usuario.displayName}
              </option>
            ))}
          </select>

          <button onClick={handleCancelar}>Cancelar</button>
          <button onClick={handleCrearGrupo}>Crear Grupo</button>
        </div>
      )}
    </div>
  );
};

export default CrearGrupo;