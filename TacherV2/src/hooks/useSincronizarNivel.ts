import { useEffect } from 'react'
import { actualizarNivel } from 'src/services/usuarios'
import type { Usuario } from 'src/types'

export function useSincronizarNivel(usuario: Usuario | null, nivelCalculado: string) {
  useEffect(() => {
    if (!usuario?.id || usuario.Rango === nivelCalculado) return

    actualizarNivel(usuario.id, nivelCalculado).catch((error) =>
      console.error('Error al actualizar nivel en Firestore:', error),
    )
  }, [usuario?.id, usuario?.Rango, nivelCalculado])
}
