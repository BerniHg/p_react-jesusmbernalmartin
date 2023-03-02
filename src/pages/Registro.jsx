import React from "react"
import Foto from "../img/annadirFoto.png"

const Registro = () => {
    return (
    <div className="formContainer">
        <div className="formWrapper">
            <span className="logo">Orange Chat</span>
            <span className="title">Registro</span>
            <form>
                <input type="text" placeholder="Nombre de usuario" />
                <input type="email" placeholder="Correo electrónico" />
                <input type="password" placeholder="Contraseña" />
                <input style={{display:"none"}} type="file" id="archivo" />
                <label htmlFor="archivo">
                    <img src={Foto} alt="" />
                    <span>Añade una foto de perfil</span>
                </label>
                <button>Regístrate</button>
            </form>
            <p>¿Ya tienes una cuenta creada? Inicia sesión</p>
        </div>
    </div>
    )
}

export default Registro