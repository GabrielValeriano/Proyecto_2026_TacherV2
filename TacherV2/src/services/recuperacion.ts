import { BACKEND_URL } from 'src/config'

/**
 * Recuperación de contraseña. Todo pasa por el backend: genera el código de 8 dígitos, lo manda
 * por mail, lo valida y cambia la contraseña en Firebase Auth (la app sola no puede cambiarle
 * la contraseña a alguien que no inició sesión).
 */

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; mensaje: string }

const ESPERA_MAXIMA_MS = 15000

async function llamar<T>(ruta: string, cuerpo: object): Promise<Resultado<T>> {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS)

  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/recuperacion/${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      signal: controlador.signal,
    })
    const datos = await respuesta.json().catch(() => ({}))
    if (respuesta.ok && datos.exito) return { ok: true, ...datos }
    return { ok: false, mensaje: datos.mensaje || 'Algo salió mal. Intentá de nuevo.' }
  } catch (error) {
    console.error(`Error llamando a /api/recuperacion/${ruta}:`, error)
    return { ok: false, mensaje: 'No pudimos conectarnos con el servidor. Revisá tu internet.' }
  } finally {
    clearTimeout(temporizador)
  }
}

/** Valida que el mail tenga cuenta y le manda el código. */
export function solicitarCodigoRecuperacion(email: string) {
  return llamar<{ segundosEntreEnvios: number }>('solicitar', { email })
}

/** Si el código es correcto devuelve un token de un solo uso para el último paso. */
export function verificarCodigoRecuperacion(email: string, codigo: string) {
  return llamar<{ token: string }>('verificar', { email, codigo })
}

/** El backend también rechaza la contraseña si es igual a la anterior. */
export function cambiarContrasenaRecuperada(email: string, token: string, password: string) {
  return llamar('cambiar', { email, token, password })
}
