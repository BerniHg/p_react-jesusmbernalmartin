import React from "react"

const Login = () => {
    return (
    <div className="formContainer">
        <div className="formWrapper">
            <span className="logo">Orange Chat</span>
            <span className="title">Inicio de sesión</span>
            <form>
                <input type="text" placeholder="Nombre de usuario" />
                <input type="password" placeholder="Contraseña" /> 
                <button>Iniciar sesión</button>
            </form>
            <p>¿No tienes una cuenta creada? Regístrate</p>
        </div>
    </div>
    )
}

export default Login