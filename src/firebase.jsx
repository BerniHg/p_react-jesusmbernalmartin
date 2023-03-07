import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUew5Hb9b5FvGADhZxy9uSoStvHyvsCM4",
  authDomain: "orange-chat-14be2.firebaseapp.com",
  projectId: "orange-chat-14be2",
  storageBucket: "orange-chat-14be2.appspot.com",
  messagingSenderId: "554730845026",
  appId: "1:554730845026:web:54537ef4e5e0fd1891f23b"
};

export const app = initializeApp(firebaseConfig)
export const auth = getAuth()
export const storage = getStorage()
export const baseDatos = getFirestore()