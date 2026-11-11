const ES_LETRA_O_NUMERO = /[\p{L}\p{N}]/u

/** Primer carácter visible de una palabra (Array.from respeta acentos y emojis). */
const primerCaracter = (palabra: string) => Array.from(palabra)[0] ?? ''

/** Separa "Juan Pérez", "gabi_eco" o "ana.lopez" en palabras. */
const palabrasDe = (nombre: string) => nombre.trim().split(/[\s._-]+/).filter(Boolean)

/** "juan pérez" -> "J". Vacío si el nombre no empieza con una letra o un número. */
export function inicialDe(nombre: string): string {
  const letra = primerCaracter(palabrasDe(nombre)[0] ?? '')
  return ES_LETRA_O_NUMERO.test(letra) ? letra.toUpperCase() : ''
}

/** "Juan Pérez" -> "JP", "gabi_eco" -> "GE", "Lucía" -> "L". Vacío si no empieza con letra o número. */
export function inicialesDe(nombre: string): string {
  const letras = palabrasDe(nombre).slice(0, 2).map(primerCaracter)
  if (letras.length === 0 || !letras.every((letra) => ES_LETRA_O_NUMERO.test(letra))) return ''
  return letras.join('').toUpperCase()
}
