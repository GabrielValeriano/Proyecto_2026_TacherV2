import { useEffect } from 'react'
import { actualizarRango } from 'src/services/usuarios'
import type { Usuario } from 'src/types'

/** Si el rango guardado en Firestore no coincide con el calculado por puntos, lo actualiza. */
export function useSincronizarRango(usuario: Usuario | null, rangoCalculado: string) {
  useEffect(() => {
    if (!usuario?.id || usuario.Rango === rangoCalculado) return

    actualizarRango(usuario.id, rangoCalculado).catch((error) =>
      console.error('Error al actualizar rango en Firestore:', error),
    )
  }, [usuario?.id, usuario?.Rango, rangoCalculado])
}
