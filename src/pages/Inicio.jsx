import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";


const Login = () => {
    const [error, errorProducido] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (valores) => {
    valores.preventDefault();
    const correo = valores.target[0].value;
    const contrasenna = valores.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, correo, contrasenna)
      navigate("/")
    } catch (error) {
      errorProducido(true);
    }
  };
    return (
    <div className="formContainer">
        <div className="formWrapper">
            <span className="logo">Orange Chat</span>
            <span className="title">Inicio de sesión</span>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Correo" />
                <input type="password" placeholder="Contraseña" /> 
                <button>Iniciar sesión</button>
                {error && <span>Something went wrong</span>}
            </form>
            <p>¿No tienes una cuenta creada? <Link to="/registro">Regístrate</Link></p>
        </div>
    </div>
    )
}

export default Login