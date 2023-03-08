import React, { useContext } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'


const Barranav = () => {
  const {currentUser} = useContext(AuthContext)
  return (
    <div className='barranav'>
      <span className='logo'>Orange Chat</span>
      <div className='user'>
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
        <button onClick={() => signOut(auth)}>cerrar sesión</button>
      </div>
    </div>
  )
}

export default Barranav