import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGZjoEaHWNmJoOVg6JipywRADQr55cw90",
  authDomain: "tacherv2-7b0ff.firebaseapp.com",
  projectId: "tacherv2-7b0ff",
  storageBucket: "tacherv2-7b0ff.firebasestorage.app",
  messagingSenderId: "19002843378",
  appId: "1:19002843378:web:5e2d96d6620b79a01b706b",
  measurementId: "G-YLN8O36NRN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Autenticación
const auth = getAuth(app);

export{ db , auth };