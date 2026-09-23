import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOzjoEaHWNmJoOVg6Jipyw...",
  authDomain: "tacherv2-7b0ff.firebaseapp.com",
  projectId: "tacherv2-7b0ff",
  storageBucket: "tacherv2-7b0ff.firebasestorage.app",
  messagingSenderId: "1900284337...",
  appId: "1:190028433...:web:5e2d96dd62db79a01704b",
  measurementId: "G-YLN8O36NRN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Autenticación
export const auth = getAuth(app);