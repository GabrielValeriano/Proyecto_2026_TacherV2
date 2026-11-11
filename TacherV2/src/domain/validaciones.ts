const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LARGO_MINIMO_PASSWORD = 8

export function esEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/** Devuelve el mensaje de error, o null si los datos son válidos. */
export function validarCredencialesRegistro(
  email: string,
  contra: string,
  confirmacion: string,
): string | null {
  if (!email || !contra || !confirmacion) return 'Por favor completá todos los campos.'
  if (!esEmailValido(email)) return 'Ingresá un correo electrónico válido (ejemplo@gmail.com).'
  if (contra.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
  }
  if (contra !== confirmacion) return 'Las contraseñas no coinciden.'
  return null
}

/** Cambio de contraseña: largo mínimo y que coincidan. Que no sea la anterior lo valida el backend. */
export function validarNuevaContrasena(nueva: string, confirmacion: string): string | null {
  if (!nueva || !confirmacion) return 'Completá los dos campos.'
  if (nueva.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
  }
  if (nueva !== confirmacion) return 'Las contraseñas no coinciden.'
  return null
}
