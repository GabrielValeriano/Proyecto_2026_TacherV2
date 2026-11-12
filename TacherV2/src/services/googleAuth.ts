import { GoogleSignin, isCancelledResponse } from '@react-native-google-signin/google-signin'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth } from 'src/firebase'
import { GOOGLE_WEB_CLIENT_ID } from 'src/config'

export interface CuentaGoogle {
  uid: string
  email: string
  nombre: string
}

/** Cierra la sesión de Google en el teléfono (para que la próxima vez se pueda elegir otra cuenta). */
export async function cerrarSesionGoogle(): Promise<void> {
  await GoogleSignin.signOut().catch(() => {})
}

export function configurarGoogleSignIn() {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false })
}

/**
 * Abre el selector de cuentas de Google y entra a Firebase con esa cuenta.
 * Devuelve null si el usuario cerró el selector (no es un error: no hay que mostrar nada).
 * Cualquier otro problema se lanza como error.
 */
export async function autenticarConGoogle(): Promise<CuentaGoogle | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

  // Cierra la sesión anterior de Google para que siempre se pueda elegir la cuenta
  await GoogleSignin.signOut().catch(() => {})

  const resultado = await GoogleSignin.signIn()
  if (isCancelledResponse(resultado)) return null

  const idToken = resultado.data?.idToken
  if (!idToken) throw new Error('Google no devolvió el idToken (revisá el webClientId).')

  const credencial = GoogleAuthProvider.credential(idToken)
  const { user } = await signInWithCredential(auth, credencial)

  const email = user.email ?? ''
  return { uid: user.uid, email, nombre: user.displayName || email.split('@')[0] || '' }
}
