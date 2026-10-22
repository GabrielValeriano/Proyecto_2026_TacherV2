/**
 * Caché en memoria de los datos que vienen de Firestore.
 * Sirve para mostrar al instante lo que ya se cargó y actualizarlo en segundo plano.
 * Se vacía al cerrar la app o al cerrar sesión.
 */

interface Entrada {
  datos: unknown
  guardadoEn: number
}

/** Si los datos son más nuevos que esto, no se vuelven a pedir. */
const MS_FRESCO = 20000

const cache = new Map<string, Entrada>()
const enCurso = new Map<string, Promise<unknown>>()
let version = 0

export const CLAVES = {
  productos: 'productos',
  ranking: 'ranking',
  reciclajes: (uid: string) => `reciclajes:${uid}`,
}

export function leerCache<T>(clave: string): T | undefined {
  return undefined
}

export function estaFresco(clave: string): boolean {
  const entrada = cache.get(clave)
  return entrada !== undefined && Date.now() - entrada.guardadoEn < MS_FRESCO
}

/**
 * Pide los datos y los guarda en el caché. Si ya hay un pedido igual en curso
 * (por ejemplo, la precarga del Home), se reutiliza en vez de pedirlo dos veces.
 */
export function cargarYGuardar<T>(clave: string, cargar: () => Promise<T>): Promise<T> {
  const pedidoActual = enCurso.get(clave) as Promise<T> | undefined
  if (pedidoActual) return pedidoActual

  const versionAlPedir = version
  const pedido = cargar()
    .then((datos) => {
      // Si mientras tanto se cerró la sesión, no se guarda nada
      if (versionAlPedir === version) cache.set(clave, { datos, guardadoEn: Date.now() })
      return datos
    })
    .finally(() => {
      enCurso.delete(clave)
    })

  enCurso.set(clave, pedido)
  return pedido
}

export function limpiarCache() {
  version += 1
  cache.clear()
  enCurso.clear()
}
