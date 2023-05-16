import Login from "./pages/Inicio";
import Registro from "./pages/Registro";
import Menu from "./pages/Menu";
import Ajustes from "./pages/Ajustes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "./style.css"
import {useContext} from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children
  };

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/">
        <Route index element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        } />
        <Route path="ajustes" element={
            <ProtectedRoute>
              <Ajustes />
            </ProtectedRoute>
          } />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
      </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
