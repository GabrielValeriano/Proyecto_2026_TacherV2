import { BACKEND_URL } from 'src/config'

/** Respuesta del backend (Backend-TacherV2/ServerNuevo.js) ya traducida a un mensaje para mostrar. */
export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; mensaje: string }

const ESPERA_MAXIMA_MS = 15000

/**
 * POST a una ruta del backend. Nunca lanza: los errores de red o del servidor vuelven como
 * `{ ok: false, mensaje }`. `idToken` va en el header Authorization para las rutas que lo piden.
 */
export async function llamarBackend<T>(
  ruta: string,
  cuerpo: object,
  idToken?: string,
): Promise<Resultado<T>> {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS)

  try {
    const respuesta = await fetch(`${BACKEND_URL}${ruta}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify(cuerpo),
      signal: controlador.signal,
    })
    const datos = await respuesta.json().catch(() => ({}))
    if (respuesta.ok && datos.exito) return { ok: true, ...datos }
    return { ok: false, mensaje: datos.mensaje || 'Algo salió mal. Intentá de nuevo.' }
  } catch (error) {
    console.error(`Error llamando a ${ruta}:`, error)
    return { ok: false, mensaje: 'No pudimos conectarnos con el servidor. Revisá tu internet.' }
  } finally {
    clearTimeout(temporizador)
  }
}
