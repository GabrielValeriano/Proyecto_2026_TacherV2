import { Image } from 'react-native'
import { obtenerProductosDisponibles } from 'src/services/productos'
import { obtenerTopRecicladores } from 'src/services/ranking'
import { obtenerUltimosReciclajes } from 'src/services/reciclajes'
import type { Producto } from 'src/types'
import { CLAVES, cargarYGuardar, estaFresco } from 'src/utils/cache'

function avisar(clave: string, error: unknown) {
  console.warn(`No se pudo precargar ${clave}:`, error)
}

/**
 * Pide en segundo plano los datos de Canjes, Ranking e Historial para que,
 * cuando el usuario entre a esas pantallas, ya estén listos.
 */
export function precargarDatos(uid: string) {
  if (!estaFresco(CLAVES.productos)) {
    cargarYGuardar<Producto[]>(CLAVES.productos, obtenerProductosDisponibles)
      .then((productos) => {
        // Además de los datos, se descargan las fotos para que aparezcan al instante
        productos.forEach((producto) => {
          if (producto.imagen) Image.prefetch(producto.imagen).catch(() => {})
        })
      })
      .catch((error) => avisar(CLAVES.productos, error))
  }

  if (!estaFresco(CLAVES.ranking)) {
    cargarYGuardar(CLAVES.ranking, () => obtenerTopRecicladores()).catch((error) =>
      avisar(CLAVES.ranking, error),
    )
  }

  const claveReciclajes = CLAVES.reciclajes(uid)
  if (!estaFresco(claveReciclajes)) {
    cargarYGuardar(claveReciclajes, () => obtenerUltimosReciclajes(uid)).catch((error) =>
      avisar(claveReciclajes, error),
    )
  }
}
