import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import { auth } from 'src/firebase'
import { existePerfil } from 'src/services/usuarios'

export type ResultadoAuth =
  | { ok: true; uid: string }
  | { ok: false; mensaje: string; codigo?: string }

const YA_REGISTRADO = 'Este correo electrónico ya se encuentra registrado. Iniciá sesión.'

const MENSAJES_AUTH: Record<string, string> = {
  'auth/email-already-in-use': YA_REGISTRADO,
  'auth/invalid-email': 'Ingresá un correo electrónico válido (ejemplo@gmail.com).',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  // Firebase no distingue "mail inexistente" de "contraseña incorrecta" (a propósito)
  'auth/invalid-credential': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/user-not-found': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/wrong-password': 'Correo o contraseña incorrectos. Intentalo de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet e intentá de nuevo.',
}

/** Convierte los errores conocidos de Auth en mensajes; los desconocidos se relanzan. */
async function ejecutarAuth(operacion: () => Promise<UserCredential>): Promise<ResultadoAuth> {
  try {
    const { user } = await operacion()
    return { ok: true, uid: user.uid }
  } catch (error) {
    const codigo = (error as { code?: string }).code ?? ''
    const mensaje = MENSAJES_AUTH[codigo]
    if (!mensaje) throw error
    return { ok: false, mensaje, codigo }
  }
}

export function iniciarSesionConEmail(email: string, password: string) {
  return ejecutarAuth(() => signInWithEmailAndPassword(auth, email, password))
}

/**
 * Crea la cuenta en Auth. Si el mail ya existe pero el registro quedó a medias
 * (cuenta sin perfil en Firestore), retoma esa cuenta en vez de bloquear al usuario.
 */
export async function crearOReanudarCuentaEmail(
  email: string,
  password: string,
): Promise<ResultadoAuth> {
  const creada = await ejecutarAuth(() => createUserWithEmailAndPassword(auth, email, password))
  if (creada.ok || creada.codigo !== 'auth/email-already-in-use') return creada

  const sesion = await iniciarSesionConEmail(email, password)
  if (!sesion.ok) return creada

  if (await existePerfil(sesion.uid)) {
    await cerrarSesionFirebase()
    return creada
  }
  return sesion
}

export const obtenerUidActual = (): string | null => auth.currentUser?.uid ?? null

export const cerrarSesionFirebase = () => signOut(auth)
