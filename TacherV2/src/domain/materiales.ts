/** Materiales que reconoce la app en el historial de reciclajes. */
export type Material = 'botella' | 'lata' | 'carton'

/** Minúsculas, sin acentos y con "_" entre palabras: "Cartón Corrugado" -> "carton_corrugado". */
function normalizar(texto?: string | null) {
  if (!texto) return ''
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const CLAVES: Record<Material, string[]> = {
  botella: ['botella', 'pet', 'plastico', 'vidrio'],
  lata: ['lata', 'latas', 'aluminio'],
  carton: ['carton', 'tetra', 'caja', 'cajas', 'papel'],
}

/**
 * Las claves cortas tienen que ser la palabra entera ("pet" no es "petaca"); las largas también
 * valen como comienzo de palabra ("botellas", "plástico", "cartones", "tetrabrik").
 */
const coincide = (palabra: string, clave: string) =>
  palabra === clave || (clave.length >= 5 && palabra.startsWith(clave))

function materialPorTexto(texto: string): Material | null {
  const palabras = texto.split('_')
  for (const material of Object.keys(CLAVES) as Material[]) {
    if (CLAVES[material].some((clave) => palabras.some((p) => coincide(p, clave)))) return material
  }
  return null
}

/** "600ml", "1,5L", "2.25 l": un volumen en el nombre indica que es una botella. */
const TIENE_VOLUMEN = /\d+([.,]\d+)?\s*(ml|cc|l|lt|lts|litros?)\b/i

/**
 * Qué material es el residuo: primero por la categoría guardada; si no hay (los reciclajes
 * viejos no la tienen), por el nombre del residuo.
 */
export function materialDelResiduo(categoria?: string | null, residuo?: string | null): Material | null {
  const porCategoria = materialPorTexto(normalizar(categoria))
  if (porCategoria) return porCategoria

  const porNombre = materialPorTexto(normalizar(residuo))
  if (porNombre) return porNombre

  return residuo && TIENE_VOLUMEN.test(residuo) ? 'botella' : null
}
