import { llamarBackend } from 'src/services/backend'

/**
 * Recuperación de contraseña. Todo pasa por el backend: genera el código de 8 dígitos, lo manda
 * por mail, lo valida y cambia la contraseña en Firebase Auth (la app sola no puede cambiarle
 * la contraseña a alguien que no inició sesión).
 */

const llamar = <T = object>(ruta: string, cuerpo: object) =>
  llamarBackend<T>(`/api/recuperacion/${ruta}`, cuerpo)

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
