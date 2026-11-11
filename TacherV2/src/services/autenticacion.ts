import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { auth } from 'src/firebase'
import { existePerfil } from 'src/services/usuarios'

export type ResultadoAuth =
  | { ok: true; uid: string; emailVerificado: boolean }
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
    return { ok: true, uid: user.uid, emailVerificado: user.emailVerified }
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
 * Si hay una sesión abierta de una cuenta cuyo registro quedó a medias (existe en Auth
 * pero no tiene perfil en Firestore), la borra de Auth para que el mail quede libre.
 * Nunca toca cuentas con perfil. Si no se puede borrar (sin conexión, sesión vieja...),
 * al menos cierra la sesión; en ese caso el registro se retoma con `crearOReanudarCuentaEmail`.
 */
export async function descartarCuentaIncompleta(): Promise<void> {
  const usuario = auth.currentUser
  if (!usuario) return

  try {
    if (await existePerfil(usuario.uid)) return
    await deleteUser(usuario)
  } catch (error) {
    console.error('No se pudo descartar la cuenta incompleta:', error)
    await signOut(auth).catch(() => {})
  }
}

/**
 * Crea la cuenta en Auth. Si el mail ya existe pero el registro quedó a medias
 * (cuenta sin perfil en Firestore), retoma esa cuenta en vez de bloquear al usuario.
 */
export async function crearOReanudarCuentaEmail(
  email: string,
  password: string,
): Promise<ResultadoAuth> {
  // Una sesión a medias de un intento anterior (por ejemplo, si cerraron la app) no debe estorbar
  await descartarCuentaIncompleta()

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

export async function cambiarContrasenaActual(
  contrasenaActual: string,
  contrasenaNueva: string,
): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  const usuario = auth.currentUser
  if (!usuario || !usuario.email) {
    return { ok: false, mensaje: 'No hay una sesión activa para cambiar la contraseña.' }
  }

  try {
    const credencial = EmailAuthProvider.credential(usuario.email, contrasenaActual)
    await reauthenticateWithCredential(usuario, credencial)
    await updatePassword(usuario, contrasenaNueva)
    return { ok: true }
  } catch (error) {
    const codigo = (error as { code?: string }).code ?? ''
    if (codigo === 'auth/wrong-password' || codigo === 'auth/invalid-credential') {
      return { ok: false, mensaje: 'La contraseña actual no es correcta.' }
    }
    if (codigo === 'auth/weak-password') {
      return { ok: false, mensaje: 'La nueva contraseña es demasiado débil.' }
    }
    if (codigo === 'auth/requires-recent-login') {
      return { ok: false, mensaje: 'Es necesario volver a iniciar sesión para cambiar la contraseña.' }
    }
    if (codigo === 'auth/too-many-requests') {
      return { ok: false, mensaje: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.' }
    }
    console.error('Error al cambiar la contraseña:', error)
    return { ok: false, mensaje: 'No se pudo cambiar la contraseña. Intentá de nuevo.' }
  }
}

export async function actualizarNombreAuth(nombre: string): Promise<void> {
  const usuario = auth.currentUser
  if (!usuario) throw new Error('No hay una sesión activa.')
  await updateProfile(usuario, { displayName: nombre })
}
