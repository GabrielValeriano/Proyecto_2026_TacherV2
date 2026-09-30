const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LARGO_MINIMO_PASSWORD = 8

export function esEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/** Devuelve el mensaje de error, o null si los datos son válidos. */
export function validarCredencialesRegistro(email: string, contra: string): string | null {
  if (!email || !contra) return 'Por favor completá todos los campos.'
  if (!esEmailValido(email)) return 'Ingresá un correo electrónico válido (ejemplo@gmail.com).'
  if (contra.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`
  }
  return null
}
