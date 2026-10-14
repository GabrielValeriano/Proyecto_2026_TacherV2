import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from 'src/firebase'

type ResultadoIngreso = { ok: true } | { ok: false; mensaje: string }

const MENSAJES_AUTH: Record<string, string> = {
  'auth/invalid-email': 'Ingresá un correo electrónico válido.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/user-not-found': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/wrong-password': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet e intentá de nuevo.',
}

export async function iniciarSesion(email: string, password: string): Promise<ResultadoIngreso> {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    return { ok: true }
  } catch (error) {
    const mensaje = MENSAJES_AUTH[(error as { code?: string }).code ?? '']
    if (!mensaje) throw error
    return { ok: false, mensaje }
  }
}

/** Un cajero es una cuenta que tiene su documento en la colección CAJEROS. */
export async function esCajero(uid: string): Promise<boolean> {
  return (await getDoc(doc(db, 'CAJEROS', uid))).exists()
}

export const cerrarSesion = () => signOut(auth)
