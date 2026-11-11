import { auth } from 'src/firebase'
import { llamarBackend, type Resultado } from 'src/services/backend'

/**
 * Verificación del correo al registrarse con un código de 8 dígitos. El backend genera el código,
 * lo manda por mail y, si es correcto, marca el mail como verificado en Firebase Auth.
 * La cuenta ya existe (se crea en la pantalla de registro): cada pedido va con su ID token.
 */

const SESION_VENCIDA: Resultado<never> = { ok: false, mensaje: 'Tu sesión expiró. Volvé a registrarte.' }

async function llamarConSesion<T>(ruta: string, cuerpo: object = {}): Promise<Resultado<T>> {
  const usuario = auth.currentUser
  if (!usuario) return SESION_VENCIDA
  let idToken: string
  try {
    idToken = await usuario.getIdToken()
  } catch (error) {
    console.error('No se pudo obtener el ID token:', error)
    return { ok: false, mensaje: 'No pudimos conectarnos con el servidor. Revisá tu internet.' }
  }
  return llamarBackend<T>(`/api/registro/${ruta}`, cuerpo, idToken)
}

export interface EnvioDeCodigo {
  /** El mail ya estaba verificado: no hace falta código. */
  yaVerificado?: boolean
  /** false = ya se había mandado uno hace poco y sigue sirviendo. */
  enviado?: boolean
  segundosParaReenviar?: number
}

/** Manda el código al mail de la cuenta actual (o avisa si ya está verificado). */
export function enviarCodigoRegistro() {
  return llamarConSesion<EnvioDeCodigo>('enviar-codigo')
}

/**
 * Valida el código. Si es correcto, refresca la cuenta para que la app (y las reglas de
 * Firestore) vean `emailVerified = true` antes de seguir.
 */
export async function verificarCodigoRegistro(codigo: string): Promise<Resultado> {
  const resultado = await llamarConSesion('verificar-codigo', { codigo })
  if (!resultado.ok) return resultado

  try {
    await auth.currentUser?.reload()
    await auth.currentUser?.getIdToken(true)
  } catch (error) {
    // El mail ya quedó verificado en el servidor; el próximo refresco del token lo va a reflejar
    console.warn('No se pudo refrescar la cuenta después de verificar:', error)
  }
  return resultado
}
