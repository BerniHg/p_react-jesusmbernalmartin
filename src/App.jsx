import Login from "./pages/Inicio";
import Registro from "./pages/Registro";
import Menu from "./pages/Menu";
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
      <Route path="">
        <Route index element={<Menu />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
      </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
