import { useEffect } from 'react'
import { actualizarRango } from 'src/services/usuarios'
import type { Usuario } from 'src/types'

export function useSincronizarRango(usuario: Usuario | null, rangoCalculado: string) {
  useEffect(() => {
    if (!usuario?.id || usuario.Rango === rangoCalculado) return

    actualizarRango(usuario.id, rangoCalculado).catch((error) =>
      console.error('Error al actualizar rango en Firestore:', error),
    )
  }, [usuario?.id, usuario?.Rango, rangoCalculado])
}
