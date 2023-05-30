import React, { useState, useContext, useEffect } from "react";
import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { baseDatos } from "./firebase";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Inicio";
import Registro from "./pages/Registro";
import Menu from "./pages/Menu";
import Ajustes from "./pages/Ajustes";
import Admin from "./pages/Admin";
import "./style.css";

function App() {
  const { currentUser } = useContext(AuthContext);
  const [rolUsuario, setRolUsuario] = useState("");

  useEffect(() => {
    const obtenerRolUsuario = async (uid) => {
      try {
        const usuarioDocRef = doc(baseDatos, "usuarios", uid);
        const usuarioDocSnap = await getDoc(usuarioDocRef);
        if (usuarioDocSnap.exists()) {
          const usuarioData = usuarioDocSnap.data();
          const userRole = usuarioData.role;
          console.log(userRole)
          setRolUsuario(userRole);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser) {
      obtenerRolUsuario(currentUser.uid);
    }
  }, [currentUser]);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    } else {
      return children;
    }
  };

  const AdminRoute = ({ children }) => {
    if (rolUsuario === "user") {
      return <Navigate to="/" />;
    } else {
      return children;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="ajustes"
            element={
              <ProtectedRoute>
                <Ajustes />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
