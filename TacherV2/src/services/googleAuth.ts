import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth } from 'src/firebase'
import { GOOGLE_WEB_CLIENT_ID } from 'src/config'

export interface CuentaGoogle {
  uid: string
  email: string
  nombre: string
}

export function configurarGoogleSignIn() {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false })
}

export async function autenticarConGoogle(): Promise<CuentaGoogle | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  
  //Cerras
  await GoogleSignin.signOut().catch(() => {})

  const resultado = await GoogleSignin.signIn()
  const idToken =
    resultado.data?.idToken ?? (resultado as { idToken?: string }).idToken
  if (!idToken) return null

  const credencial = GoogleAuthProvider.credential(idToken)
  const { user } = await signInWithCredential(auth, credencial)

  const email = user.email ?? ''
  return { uid: user.uid, email, nombre: user.displayName || email.split('@')[0] || '' }
}
