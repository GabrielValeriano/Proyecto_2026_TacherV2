/**
 * Reglas del nombre de usuario: largo y filtro de palabras inapropiadas.
 * Se usan en el registro, al editar el perfil y en los servicios antes de escribir en Firestore.
 */

export const LARGO_MINIMO_NOMBRE = 3
export const LARGO_MAXIMO_NOMBRE = 16

export const MENSAJE_NOMBRE_INAPROPIADO =
  'Ese nombre de usuario no está permitido porque contiene palabras ofensivas o inapropiadas. Elegí otro.'

/**
 * Se buscan en cualquier parte del nombre, aunque esté pegado a otras palabras ("elpelotudo123").
 * Solo términos que no aparecen dentro de palabras comunes.
 */
const PROHIBIDAS_EN_CUALQUIER_PARTE = [
  'pelotudo', 'pelotuda', 'boludo', 'boluda', 'conchudo', 'conchuda', 'conchetumadre',
  'conchadetumadre', 'hijodeputa', 'hijadeputa', 'laputa', 'putita', 'putito', 'putazo',
  'lpm', 'hdp', 'ctm', 'mierda', 'sorete', 'ojete', 'pajero', 'pajera', 'garcha', 'garchar',
  'cagon', 'cagona', 'cornudo', 'cornuda', 'maricon', 'mogolico', 'mogolica',
  'tarado', 'tarada', 'idiota', 'imbecil', 'estupido', 'estupida', 'chupala', 'chupamela',
  'chupapija', 'chupaverga', 'porno', 'pedofilo', 'violador', 'nazi', 'hitler',
]

/**
 * Se bloquean solo como palabra suelta: dentro de otras son inofensivas
 * ("computadora", "pijama", "vehículo", "escoger", "controla", "Peter", "Maricarmen"...).
 */
const PROHIBIDAS_COMO_PALABRA = [
  'puta', 'puto', 'putas', 'putos', 'pija', 'verga', 'concha', 'culo', 'culos', 'orto',
  'forro', 'forra', 'choto', 'chota', 'coger', 'cogida', 'trolo', 'trola', 'teta', 'tetas',
  'pete', 'petera', 'sexo', 'cagar', 'mamada', 'marica',
]

/** Números y símbolos que se usan para disfrazar letras: "put0", "p3l0tud0", "@sesino". */
const SUSTITUCIONES: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i',
}

/** Minúsculas, sin acentos y con las sustituciones aplicadas. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[0-9@$!]/g, (c) => SUSTITUCIONES[c] ?? c)
}

/** "puuuuto" -> "puto". Se prueba con y sin esto: "forro" tiene rr de verdad. */
const sinLetrasRepetidas = (texto: string) => texto.replace(/(.)\1+/g, '$1')
const variantes = (texto: string) => [texto, sinLetrasRepetidas(texto)]

const COMO_PALABRA = new Set(PROHIBIDAS_COMO_PALABRA)

export function contienePalabraInapropiada(nombre: string): boolean {
  // "ElPuto" -> "El Puto": las mayúsculas en el medio también separan palabras
  const conEspacios = nombre.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')

  const palabras = normalizar(conEspacios).split(/[^a-z]+/).filter(Boolean)
  if (palabras.some((palabra) => variantes(palabra).some((v) => COMO_PALABRA.has(v)))) return true

  // Todo junto, sin espacios ni símbolos: así "p.e.l.o.t.u.d.o" o "boludo_123" no pasan
  return variantes(palabras.join('')).some((pegado) =>
    PROHIBIDAS_EN_CUALQUIER_PARTE.some((termino) => pegado.includes(termino)),
  )
}

/** Espacios de más afuera y en el medio. */
export const limpiarNombreUsuario = (nombre: string) => nombre.trim().replace(/\s+/g, ' ')

/** Devuelve el mensaje de error, o null si el nombre es válido. Espera el nombre ya limpio. */
export function validarNombreUsuario(nombre: string): string | null {
  // Array.from cuenta bien los emojis y las letras con acento
  const largo = Array.from(nombre).length
  if (largo === 0) return 'Ingresá un nombre de usuario.'
  if (largo < LARGO_MINIMO_NOMBRE) {
    return `El nombre de usuario es muy corto: tiene que tener al menos ${LARGO_MINIMO_NOMBRE} caracteres.`
  }
  if (largo > LARGO_MAXIMO_NOMBRE) {
    return `El nombre de usuario es muy largo: puede tener hasta ${LARGO_MAXIMO_NOMBRE} caracteres (tiene ${largo}).`
  }
  if (contienePalabraInapropiada(nombre)) return MENSAJE_NOMBRE_INAPROPIADO
  return null
}
