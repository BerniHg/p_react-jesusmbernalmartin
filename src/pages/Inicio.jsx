import React, { useState, useEffect } from "react";
import PaginaCarga from "../components/PaginaCarga";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, baseDatos } from "../firebase";
import {
  where,
  query,
  getDocs,
  collection,
} from "firebase/firestore";
import md5 from "md5";

const Login = () => {
  const [error, setError] = useState(false);
  const [disable, setDisable] = useState(false);
  const [mostrarPaginaCarga, setMostrarPaginaCarga] = useState(false);
  const [mostrarContrasenna, setMostrarContrasenna] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisable(false);
    setError(false);
    setMostrarContrasenna(false);
    const correo = event.target[0].value;
    const contrasenna = event.target[1].value;
  
    try {
      setMostrarPaginaCarga(true);
      const usuariosSnapshot = await getDocs(
        query(collection(baseDatos, "usuarios"), where("email", "==", correo))
      );
  
      const enableValues = usuariosSnapshot.docs.map((doc) => doc.data().enable);
      const enable = enableValues.includes(true);
      
      if (!enable) {
        setDisable(true);
      } else {
        await signInWithEmailAndPassword(auth, correo, md5(contrasenna));
        navigate("/");
      }
    } catch (error) {
      setError(true);
    } finally {
      setMostrarPaginaCarga(false);
    }
  };
  
  const handleTogglePassword = () => {
    setMostrarContrasenna(!mostrarContrasenna);
  };

  useEffect(() => {
    return () => {
      // Realizar limpieza de efecto
    };
  }, []);

  return (
    <div className="formContainer">
      {mostrarPaginaCarga ? (
        <PaginaCarga />
      ) : (
        <div className="formWrapper">
          <span className="logo">Orange Chat</span>
          <span className="titulo">Inicio de sesión</span>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Correo" />
            <div className="input-password-container">
              <input
                type={mostrarContrasenna ? "text" : "password"}
                placeholder="Contraseña"
              />
              <button type="button" onClick={handleTogglePassword}>
                {mostrarContrasenna ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {error && (
              <span className="error">Correo o contraseña inválidos.</span>
            )}
            {disable && (
              <span className="error">Correo o contraseña inválidos.</span>
            )}
            <button type="submit">Iniciar sesión</button>
          </form>
          <p>
            ¿No tienes una cuenta creada? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
