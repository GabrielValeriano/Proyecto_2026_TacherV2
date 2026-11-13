import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: "AIzaSyBGZjoEaHWNmJoOVg6JipywRADQr55cw90",
  authDomain: "tacherv2-7b0ff.firebaseapp.com",
  projectId: "tacherv2-7b0ff",
  storageBucket: "tacherv2-7b0ff.firebasestorage.app",
  messagingSenderId: "19002843378",
  appId: "1:19002843378:web:5e2d96d6620b79a01b706b",
  measurementId: "G-YLN8O36NRN"
}

// 1) Primero se crea la app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// 2) Autenticación: la sesión queda guardada en el teléfono aunque se cierre la app
const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    })
  } catch {
    return getAuth(app) // ya estaba inicializado (pasa al recargar en caliente)
  }
})()

// 3) Firestore con long polling: evita los avisos "Listen stream transport errored"
const db = (() => {
  try {
    return initializeFirestore(app, { experimentalForceLongPolling: true })
  } catch {
    return getFirestore(app) // ya estaba inicializado (pasa al recargar en caliente)
  }
})()

export { db, auth }