import { useEffect, useState } from 'react'
import { obtenerUltimoCanje } from 'src/services/canjes'
import type { Canje } from 'src/types'

export function useUltimoCanje(nombreUsuario?: string) {
  const [canje, setCanje] = useState<Canje | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!nombreUsuario) return

    let cancelado = false
    setCargando(true)
    setError('')

    obtenerUltimoCanje(nombreUsuario)
      .then((resultado) => {
        if (!cancelado) setCanje(resultado)
      })
      .catch((err) => {
        console.error('Error al cargar el canje:', err)
        if (!cancelado) setError('No se pudo cargar tu canje. Intentalo de nuevo más tarde.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [nombreUsuario])

  return { canje, cargando, error }
}
