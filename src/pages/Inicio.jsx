import React, { useState, useEffect } from "react";
import PaginaCarga from "../components/PaginaCarga";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [error, setError] = useState(false);
  const [mostrarPaginaCarga, setMostrarPaginaCarga] = useState(false);
  const [mostrarContrasenna, setMostrarContrasenna] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const correo = event.target[0].value;
    const contrasenna = event.target[1].value;

    try {
      setMostrarPaginaCarga(true);
      await signInWithEmailAndPassword(auth, correo, contrasenna);
      navigate("/");
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
              <span className="error">Correo o contraseña incorrectos.</span>
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